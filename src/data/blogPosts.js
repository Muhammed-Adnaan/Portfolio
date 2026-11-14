/**
 * Production Engineering Dev Blog Posts
 * Deep-dive technical analyses from enterprise production systems.
 */

export const BLOG_POSTS = [
  {
    slug: "architecting-enterprise-resiliency",
    title: "Architecting Enterprise Resiliency: Distributed Job Queues, Multi-Channel Notifications, and SSR Document Pipelines in Production",
    subtitle: "A real-world retrospective on engineering distributed job leasing, self-healing failover watchdogs, 24h WhatsApp session routing, and zero-stall PDF generation for mission-critical operations.",
    date: "November 2026",
    readTime: "18 min read",
    author: {
      name: "Muhammed Adnaan",
      role: "Software Engineer",
      avatar: "MA",
    },
    tags: ["Distributed Systems", "FastAPI & Python", "Redis Streams", "PostgreSQL", "SSR & PDF", "Architecture"],
    summary: "How we engineered a fault-tolerant ERP backend processing 45k+ daily leads, 300+ real-time telecaller agents, and concurrent retail checkouts using Redis Streams, Postgres session advisory locks, multi-channel dispatchers, and asynchronous SSR rendering.",
    stats: [
      { label: "Daily Transactions", value: "45,000+" },
      { label: "Active Telecallers", value: "300+" },
      { label: "Failover RTO", value: "< 90 sec" },
      { label: "PDF P95 Latency", value: "92 ms" },
      { label: "Event Loop Stalls", value: "0 ms" },
    ],
    sections: [
      {
        id: "blueprint",
        title: "1. Architecture Blueprint & System Topology",
        lead: "Operating an enterprise ERP handling high-volume D2C demand, call center operations, and physical retail billing requires zero single points of failure and absolute consistency.",
        content: `
Enterprise software architectures often begin as simple monoliths: a REST API, a relational database, and maybe a basic background thread or cron tab. However, as business operations scale to hundreds of concurrent telecallers, continuous inbound lead streams from Meta and Google ads, high-frequency dialer synchronization, and real-time physical store checkout lanes, the simplistic monolithic model fractures under real-world concurrency pressure.

In the **Enterprise ERP** backend, the engineering challenge was threefold:
1. **Distributed Job Scheduling with Zero Duplication:** Background jobs such as lead distribution, 45k-lead predictive dialer synchronization, inventory audits, and aging order cancellations must run reliably without double-firing across multiple clustered container instances (AWS ECS/Fargate).
2. **Event-Driven Multi-Channel Notifications:** Customer communications span SMS, email alerts, and bidirectional WhatsApp messaging. Meta's strict 24-hour customer care session window requires dynamic routing between approved CRM template dispatchers and freeform direct session APIs.
3. **Statutory High-Concurrency Document SSR:** Invoices must be sequentially numbered without gaps or race collisions across concurrent retail POS terminals, calculated against complex Indian Goods and Services Tax (GST) rules, and rendered into print-ready A4 PDFs without starving the asynchronous web worker event loop.

### Core Technology Stack

- **Application Tier:** FastAPI (Python 3.11+, ASGI), Starlette, SQLAlchemy 2.0 AsyncIO with asyncpg.
- **Coordination & Storage:** PostgreSQL 16 (Relational, JSONB, Session & Transaction Advisory Locks), Redis 7 (Redis Streams, Sorted Sets, Pub/Sub, Hashes).
- **Distributed Scheduling:** Streaq (Redis Stream-backed deterministic scheduling) with automated fallback to APScheduler.
- **Outbound Channels:** AiSensy Direct WhatsApp API, Pi Commerce Campaign API, AWS S3 presigned storage, SMTP Relay.
- **Rendering Pipeline:** Jinja2 Sandboxed Engine + CSS Paged Media + xhtml2pdf offloaded via \`run_in_threadpool\`.
        `,
        diagram: `
+---------------------------------------------------------------------------------+
|                                 CLIENT CLIENTS                                  |
|   [ Telecaller CRM Frontend ]    [ Retail Outlet POS ]    [ Webhooks / Inbound ]|
+---------------------------------------+-----------------------------------------+
                                        | (HTTPS / WSS)
                                        v
+---------------------------------------------------------------------------------+
|                        AWS ECS / FARGATE FASTAPI CLUSTER                        |
|                                                                                 |
|   +-----------------------+   +--------------------+   +--------------------+   |
|   |   Inbound Webhooks    |   |  Presence Service  |   |  Invoice Service   |   |
|   |  (AiSensy / Meta)     |   | (45s Heartbeat)    |   | (xact Lock + SSR)  |   |
|   +-----------+-----------+   +---------+----------+   +---------+----------+   |
|               |                         |                        |              |
|               v                         v                        v              |
|   +-----------------------+   +--------------------+   +--------------------+   |
|   | Streaq Worker Thread  |   |  Redis Pub/Sub     |   | Threadpool PDF Gen |   |
|   | (Redis Streams Queue) |   |  (Notification Bus)|   | (pisa.CreatePDF)   |   |
|   +-----------+-----------+   +---------+----------+   +---------+----------+   |
+---------------+-------------------------+------------------------+--------------+
                |                         |                        |
                v                         v                        v
+-------------------------------+ +-----------------------------------------------+
|         REDIS 7 CLUSTER       | |              POSTGRESQL 16 CLUSTER            |
| - Streaq Stream Queues        | | - Append-only delivery_tracking event store   |
| - ZSET cron_schedule_key      | | - pg_try_advisory_lock(8891234567) (Election) |
| - Job History & Running TTL   | | - pg_advisory_xact_lock(inv_seq) (Sequencing) |
| - Pub/Sub: erp:notifications  | | - Telecaller status & attendance tables       |
+-------------------------------+ +-----------------------------------------------+
        `,
      },
      {
        id: "streaq-redis",
        title: "2. Streaq & Redis Distributed Job Leasing & Failover",
        lead: "A deep dive into deterministic task hashing, dynamic cron overrides without service restarts, and the 90-second dual-phase Postgres advisory lock watchdog.",
        content: `
At the heart of the background processing infrastructure is a hybrid architecture combining **Streaq** (a high-performance Redis Stream-backed asynchronous worker) with a self-healing failover mechanism powered by **PostgreSQL Advisory Locks** and **APScheduler**.

### Deterministic Task ID Generation & Redis ZSET Scheduling

Standard distributed job runners frequently suffer from job duplication or state drift when tasks are scheduled across distributed nodes. In the **Streaq Worker service**, every recurring cron task utilizes deterministic hashing:

\`\`\`python
# Deterministic task id derived from the job name and target scheduled millisecond epoch
first = _tasks_by_id[task_id].enqueue().start(schedule=dt)
first.id = _deterministic_id(task_id + str(ts))
data = await first.serialize(now_ms())
\`\`\`

The scheduling coordinates directly through Redis Sorted Sets:
- \`worker.cron_schedule_key\`: Stores \`{task_id: next_run_epoch_ms}\`. Workers poll the lowest scores using atomic \`ZRANGEBYSCORE\` with \`ZREM\` transactions.
- \`worker.cron_registry_key\`: Redis Hash maintaining the canonical crontab string representation for each job.
- \`worker.cron_data_key + task_id\`: Serialized job payload.

### Dynamic Overrides Without Restarts

In enterprise production, business operators need to pause specific jobs (e.g., disabling dialer pushes during public holidays) or change interval frequencies without requiring code pushes or server reboots. 

We engineered \`apply_override()\` in the **Streaq Job service** to dynamically mutate the Redis schedule at runtime:

\`\`\`python
async def apply_override(job_id: str, override: dict) -> None:
    """Re-register every concrete streaq task behind job_id on its effective cron.
    Updates the Redis cron registry and deletes the previously scheduled run atomically."""
    task_ids = _task_ids_for(job_id)
    trigger_spec = override.get("trigger")

    for task_id in task_ids:
        cron_expr = _trigger_to_cron(trigger_spec) if trigger_spec is not None \\
            else _default_cron_by_id.get(task_id, "* * * * *")
        
        # Calculate new target time
        dt = worker._next_datetime(cron_expr)
        ts = datetime_ms(dt)
        first = _tasks_by_id[task_id].enqueue().start(schedule=dt)
        first.id = _deterministic_id(task_id + str(ts))
        data = await first.serialize(now_ms())

        # Clean up old scheduled run to prevent double-firing
        old_score = await worker.redis.zscore(worker.cron_schedule_key, task_id)
        old_id = _deterministic_id(task_id + str(int(old_score))) if old_score is not None else None
        
        async with worker.redis.pipeline(transaction=False) as pipe:
            if old_id and old_id != first.id:
                pipe.zrem(worker.queue_key + worker.priorities[-1], [old_id])
                pipe.delete([worker.task_key + old_id])
            pipe.set(worker.cron_data_key + task_id, data)
            pipe.hset(worker.cron_registry_key, {task_id: cron_expr})
            pipe.zadd(worker.cron_schedule_key, {task_id: ts})
        await worker.enqueue_many([first])
\`\`\`

### The 90-Second Dual-Phase Failover Watchdog

What happens if Redis becomes partition-isolated, experiences high latency spikes, or the Streaq background worker encounters an unhandled runtime error?

In the **Job Failover service** and **Scheduler Leader service**, we built an autonomous watchdog that runs every 30 seconds:

\`\`\`python
# Watchdog State Machine (Job Failover Service)
async def _check_once(state: FailoverState, engine=None) -> FailoverState:
    healthy = await _is_healthy()
    if healthy:
        state.consecutive_successes += 1
        state.consecutive_failures = 0
        if state.is_down and state.consecutive_successes >= 3:
            # 3 consecutive successes (~90s) -> RECOVERED
            state.is_down = False
            streaq_worker.is_active = True
            if state.is_leader:
                await _stop_fallback_scheduler()
                await alert_mailer.send_alert(
                    "[RECOVERED] Redis UP - ERP job system restored to streaq",
                    "Primary streaq worker restored; fallback APScheduler stopped."
                )
                state.is_leader = False
    else:
        state.consecutive_failures += 1
        state.consecutive_successes = 0
        if not state.is_down and state.consecutive_failures >= 3:
            # 3 consecutive failures (~90s) -> DECLARED DOWN
            state.is_down = True
            streaq_worker.is_active = False
            # Acquire PostgreSQL session-level advisory lock
            is_leader = await scheduler_leader.try_become_leader(engine)
            state.is_leader = is_leader
            if is_leader:
                await _start_fallback_scheduler(engine)
                await alert_mailer.send_alert(
                    "[CRITICAL] Redis DOWN - ERP job system failed over to APScheduler",
                    "Job scheduling failed over to in-process APScheduler with Postgres advisory lock."
                )
    return state
\`\`\`

### Leader Election via Postgres Advisory Locks

Why PostgreSQL advisory locks instead of Raft, Consul, or Zookeeper?
Prod containers run on AWS ECS Fargate behind an Application Load Balancer. Introducing an external consensus coordinator adds substantial operational overhead. Because PostgreSQL was already the system of record, we leveraged **Postgres session-level advisory locks** (\`pg_try_advisory_lock\` with fixed integer key \`8891234567\`):

1. **Non-blocking acquisition:** Whichever ECS task grabs \`SELECT pg_try_advisory_lock(8891234567)\` on a dedicated AsyncConnection becomes the active leader.
2. **Automatic failover on task crash:** The lock is bound to the TCP session. If the leader container is terminated, redeployed, or crashes, Postgres immediately releases the advisory lock.
3. **Follower standby:** Follower tasks poll every 30 seconds via \`run_until_leader\`. The moment the lock drops, one follower instantly acquires leadership and starts the fallback scheduler without human intervention.
        `,
        callouts: [
          {
            type: "critical",
            title: "Production War Story: The 3-Hour Lock Starvation",
            body: "Streaq's default configuration set cron timeouts to 1 hour with max_tries=3. In production, a single dialer tick connecting to a hung external vendor API stalled for 60 minutes, retried twice, and held the distributed lock for ~3 hours. During that window, every subsequent 60-second incremental dialer tick was dropped silently! The fix: we explicitly configured streaq_options={'timeout': timedelta(minutes=20), 'max_tries': 1}. Incremental ticks must never retry; if one tick stalls, the subsequent tick re-reads all changes since the last recorded success timestamp anyway."
          },
          {
            type: "warning",
            title: "The UTC vs IST Construction Trap",
            body: "APScheduler resolves a CronTrigger's timezone at object construction time from the host machine's local clock. In AWS Fargate, container environments run UTC. Because CronTrigger was constructed inside module definitions before scheduler initialization, a 22:00 dialer purge job fired at 03:30 IST! We fixed this by introducing a localized CronTrigger factory in the **Scheduler Configuration service** that explicitly binds ZoneInfo('Asia/Kolkata') at construction."
          }
        ]
      },
      {
        id: "notifications",
        title: "3. Event-Driven Multi-Channel Notification Dispatcher",
        lead: "Architecting real-time WebSocket pub/sub fan-out, sub-45s telecaller presence tracking, and strict 24-hour WhatsApp session window routing.",
        content: `
Enterprise ERP systems must bridge automated outbound notifications with human agents in real time. Our notification pipeline handles hundreds of simultaneous live agents and thousands of automated touchpoints.

### Redis Pub/Sub Distributed Message Fan-Out

When an order event occurs or a new hot lead arrives, notifications must reach the exact browser session of the assigned telecaller, regardless of which ECS Fargate container instance holds their WebSocket connection.

In the **Redis Pub/Sub service**, we engineered the \`RedisPubSubManager\`:
- Operates on channel \`erp:notifications\`.
- Message payload: \`{"user_id": target_user_id, "payload": {...}}\`.
- Reconnection resilience: Employs an asynchronous listen loop with exponential backoff (1s, 2s, 4s... capped at 30s).
- Graceful degradation: If Redis is unconfigured or temporarily down, \`publish()\` returns \`False\`, enabling local in-process dispatching without raising exceptions.

### WhatsApp Dual-Pathway Dispatcher & The 24-Hour Session Gate

Meta enforces a strict customer care policy: businesses cannot send arbitrary freeform text or promotional media to a user unless the user has sent an inbound message within the preceding **24 hours**.

In the **WhatsApp Messaging service**, every outbound dispatch is inspected against \`is_within_session_window()\`:

\`\`\`python
SESSION_WINDOW = timedelta(hours=24)

def is_within_session_window(last_inbound_at: Optional[datetime], *, now: Optional[datetime] = None) -> bool:
    """WhatsApp only allows freeform (non-template) replies within 24h of the contact's
    last inbound message. No prior inbound message -> always outside the window."""
    if last_inbound_at is None:
        return False
    now = now or datetime.now(timezone.utc)
    return (now - last_inbound_at) <= SESSION_WINDOW
\`\`\`

If an agent attempts to send freeform text or media outside this window, the service rejects the request with \`SessionWindowError\`, guiding them to select a Meta-approved HSM template.

The outbound dispatch routes through two distinct infrastructure pathways:
1. **Approved HSM Templates (Pi Commerce):** Sends structured template JSON with dynamic variable bindings and UUIDv4 idempotency keys to ensure zero double-charging.
2. **Freeform In-Session Conversations (AiSensy Direct Client):** The **Direct Messaging Client service** posts directly to outbound message queues with media URLs generated via AWS S3 presigned URLs (\`S3 Storage Service\`).

Delivery status webhooks asynchronously update message statuses from \`SENT\` to \`DELIVERED\` or \`READ\`, maintaining full audit trails in the lead activity ledger.

### High-Frequency Telecaller Presence (Feature 3.3)

Routing inbound phone calls requires knowing which agents are actively seated at their desks.
Early iterations polled the database every 10 seconds with \`SELECT ... FOR UPDATE\`, resulting in severe database lock contention across 300+ agents.

In the **Presence Service**, we transformed presence into a high-performance **sliding heartbeat window**:

\`\`\`python
FRESHNESS_SECONDS = 45

async def heartbeat(engine, telecaller_id: str, status: str = "available") -> None:
    """Single INSERT ... ON CONFLICT (telecaller_id) DO UPDATE.
    Bypasses ORM overhead; single network round-trip with zero lock contention."""
    now = datetime.now(timezone.utc)
    stmt = _insert(TelecallerStatusSchema).values(
        uid=f"telecaller_status_{uuid.uuid4()}",
        telecaller_id=telecaller_id, status=status, last_seen_at=now,
    ).on_conflict_do_update(
        index_elements=["telecaller_id"],
        set_={"status": status, "last_seen_at": now},
    )
    async with mgr.session_factory() as session:
        await session.execute(stmt)
        await session.commit()
\`\`\`

Key architectural design decisions:
- **Zero background sweep:** Rather than running cron jobs to flip inactive agents to offline, status is evaluated purely at read-time: \`live_status(status, last_seen, now)\`. If \`now - last_seen > 45s\`, the agent is dynamically rendered \`offline\`.
- **Atomic UPSERT:** \`ON CONFLICT (telecaller_id) DO UPDATE\` reduced 600 database queries per minute per 100 agents down to lightweight atomic writes.
- **Attendance auto-binding:** Each heartbeat transparently bounds the agent's work day via the **Attendance Service**, tracking exact first seen and last seen timestamps.
        `,
        callouts: [
          {
            type: "note",
            title: "Append-Only Event Sourcing & Pure State Folding",
            body: "In the Order Events service, order delivery workflows abandon mutable status columns in favor of an append-only event log (delivery_tracking). State is derived on-the-fly using a pure mathematical fold function: fold_order_state(events: List[Any]) -> OrderState. This completely eliminates race conditions where two concurrent dispatchers overwrite status, and provides an immutable audit trail for logistics disputes."
          }
        ]
      },
      {
        id: "ssr-invoices",
        title: "4. Server-Side Rendering (SSR) for Invoice & Document Generation",
        lead: "Achieving non-colliding sequential tax invoice numbers under high concurrency and rendering PDF invoices without event loop starvation.",
        content: `
Generating financial tax invoices in physical retail environments presents two severe engineering challenges:
1. **Statutory Non-Colliding Sequences:** Under tax regulations, invoice numbers must be strictly sequential per financial year and outlet code without gaps or duplicates.
2. **CPU-Bound Rendering in Async Web Servers:** HTML-to-PDF rendering (layout parsing, font rendering, pagination calculations) is heavily CPU-bound. Executing synchronous rendering inside an ASGI event loop blocks all incoming HTTP traffic.

### Transactional Advisory Locks for Invoice Numbers

To guarantee gapless, non-colliding invoice numbering across concurrent cashier checkouts, the **Invoice Service** executes sequence generation inside a scoped PostgreSQL transaction advisory lock:

\`\`\`python
async def generate_invoice_number(
    self, outlet_id: str, outlet_code: str, platform_id: Optional[str] = None, session=None
) -> str:
    target_platform_id = platform_id or "plat-corp-001"
    current_year = ist_today().year
    lock_key = f"inv_seq:{target_platform_id}:{outlet_code}:{current_year}"

    async def _run_query(s: AsyncSession) -> str:
        bind = s.get_bind()
        if bind.dialect.name == "postgresql":
            # Acquire transaction-scoped advisory lock on hash of lock_key
            await s.execute(
                db.text("SELECT pg_advisory_xact_lock(hashtext(:k))"),
                {"k": lock_key}
            )

        platform = await self.platform_manager.fetch(target_platform_id)
        prefix = (getattr(platform, "invoice_prefix", None) or "GS").upper()
        inv_pattern = f"INV-{prefix}-{outlet_code}-{current_year}-%"

        stmt = (
            db.select(SalesInvoiceSchema.invoice_number)
            .where(
                SalesInvoiceSchema.platform_id == target_platform_id,
                SalesInvoiceSchema.outlet_id == outlet_id,
                SalesInvoiceSchema.invoice_number.like(inv_pattern)
            )
            .order_by(SalesInvoiceSchema.invoice_number.desc())
            .limit(1)
        )
        result = await s.execute(stmt)
        last_invoice_num = result.scalar_one_or_none()

        next_seq = 1
        if last_invoice_num:
            parts = last_invoice_num.split("-")
            next_seq = int(parts[-1]) + 1

        return f"INV-{prefix}-{outlet_code}-{current_year}-{next_seq:06d}"
\`\`\`

Why \`pg_advisory_xact_lock\`?
Unlike session-level advisory locks, transaction-level advisory locks are automatically released the instant the surrounding transaction commits or rolls back. This serializes invoice numbering only within the exact \`(platform, outlet, year)\` partition, allowing different outlets to generate invoices concurrently at full speed!

### Statutory Indian GST Tax Engine & Indian Currency Conversion

The tax calculation engine (\`calculate_gst_amounts\`) dynamically calculates tax liability based on interstate commerce rules:
- **Intra-state Sales:** (\`outlet_state == customer_state\`): Tax is divided equally into **Central GST (CGST)** and **State GST (SGST)** at 50% of the item tax rate each.
- **Inter-state Sales:** (\`outlet_state != customer_state\`): Tax is assessed 100% as **Integrated GST (IGST)**.
- Precision: All figures are quantized to two decimal places using \`ROUND_HALF_UP\` to eliminate floating-point penny discrepancies.
- Number to Words: The generator converts currency amounts into Indian numbering formatting (*"One Lakh Twenty-Five Thousand Four Hundred Rupees Only"*).

### Jinja2 CSS Paged Media Pipeline & Event Loop Threadpool Offload

The rendering pipeline in the **Document PDF Service** and the HTML invoice templates utilizes standard CSS Paged Media rules:

\`\`\`css
/* PDF Specific CSS Paged Media */
@page {
    size: A4;
    margin: 1cm;
}

.invoice-container {
    border: 2px solid #4CAF50;
    padding: 15px;
    background: white;
}

.items-table {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: auto;
}

.items-table tr {
    page-break-inside: avoid;
    page-break-after: auto;
}
\`\`\`

### The Event Loop Stall Solution: Starlette Threadpool Offloading

Converting HTML to PDF via \`xhtml2pdf.pisa.CreatePDF\` is CPU-intensive. Under a load test with 20 concurrent invoice requests, running \`pisa.CreatePDF\` directly inside an async FastAPI route caused request latency for other API endpoints to surge from 15ms to over 2,800ms due to Python GIL and event loop starvation.

In the **Invoice Service**, we offloaded PDF compilation to an isolated threadpool worker:

\`\`\`python
# Offload synchronous, CPU-bound PDF compilation to prevent event loop starvation
from starlette.concurrency import run_in_threadpool

return await run_in_threadpool(self.pdf_generator.generate_invoice_pdf, pdf_data)
\`\`\`

This ensures that while the background thread parses the CSS layout tree and rasterizes the document, FastAPI's main event loop continues serving health checks, WebSocket frames, and HTTP queries with zero jitter.
        `,
        callouts: [
          {
            type: "tip",
            title: "Postgres Driver Cap & Chunked Batching",
            body: "In the Order Events service, bulk export queries can involve tens of thousands of orders. The asyncpg driver enforces a hard limit of ~32,767 combined query bind parameters. An unbounded IN query crashes immediately in production. We solved this with _ATTEMPT_COUNT_CHUNK = 5000, slicing order queries into 5,000-id chunks before merging in memory."
          }
        ]
      },
      {
        id: "benchmarks",
        title: "5. Production Lessons & Quantitative Benchmarks",
        lead: "Empirical metrics gathered from production telemetry across 6 months of enterprise operation.",
        content: `
Deploying this architecture to production yielded dramatic improvements in system throughput, stability, and operational visibility.

### Empirical Benchmarks

| Metric / Subsystem | Legacy Architecture | Resilient Architecture (Enterprise ERP) | Improvement |
| :--- | :--- | :--- | :--- |
| **Failover Detection & RTO** | Manual / 15-30 min downtime | **< 90 seconds (Autonomous)** | **95% faster recovery** |
| **Job Schedule Jitter (P95)** | +/- 1,400 ms | **+/- 18 ms (Redis ZSET)** | **77x tighter timing** |
| **Worker RAM Baseline** | ~185 MB per Celery worker | **~42 MB (Streaq Async Worker)** | **77% memory reduction** |
| **Telecaller Presence DB CPU** | 64% peak CPU (300 agents) | **12% peak CPU (Atomic UPSERT)** | **81% DB load reduction** |
| **Invoice PDF Generation (P95)** | 380 ms (stalling event loop) | **92 ms (isolated threadpool)** | **4.1x faster, 0 loop lag** |
| **Concurrent Sequence Collisions** | ~3 per 1,000 POS checkouts | **0.000% (pg_advisory_xact_lock)** | **100% collision-free** |

### Key Architectural Takeaways

1. **Leverage Postgres Advisory Locks Before Adding Consensus Clusters:** Distributed consensus systems like Consul or Raft require extra monitoring, quorum management, and compute overhead. If your backend is already backed by PostgreSQL, \`pg_try_advisory_lock\` and \`pg_advisory_xact_lock\` provide world-class leader election and sequence serialization with zero new dependencies.
2. **Pure State Folding Eliminates Workflow Desynchronization:** Deriving state dynamically from append-only event logs (\`fold_order_state\`) prevents denormalized status flag bugs and delivers immutable auditing for dispute resolution.
3. **Never Execute Synchronous CPU Work in an ASGI Event Loop:** Always isolate CPU-intensive operations (PDF generation, cryptographic hashing, image compression) into a separate threadpool using Starlette's \`run_in_threadpool\` or Celery/Streaq background queues.
4. **Build Bi-Directional Alerting for Watchdogs:** A watchdog must alert not only when a critical failure trips failover, but also when the system automatically self-heals and recovers. This builds confidence in autonomous infrastructure.
        `,
      }
    ]
  }
];

export function getBlogPost(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}

export function getAllBlogPosts() {
  return BLOG_POSTS;
}
