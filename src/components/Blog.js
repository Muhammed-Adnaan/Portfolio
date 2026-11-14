import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "./PageShell";
import PageNav from "./PageNav";
import { useRetro, enterHeader } from "../lib/retro";
import { revealOnScroll } from "../lib/retroScroll";
import { BLOG_POSTS } from "../data/blogPosts";
import ArrowRight from "./assets/images/arrow-right.png";

const CATEGORIES = [
  "All",
  "Distributed Systems",
  "Redis Streams",
  "PostgreSQL",
  "FastAPI & Python",
  "SSR & PDF",
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.tags.includes(selectedCategory);
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const scope = useRetro(() => {
    enterHeader("[data-retro='header'] > *");
    revealOnScroll("[data-retro='featured-card']", { stagger: 0.08 });
    revealOnScroll("[data-retro='post-card']", { stagger: 0.08 });
    revealOnScroll("[data-retro='topic-card']", { stagger: 0.06 });
  });

  const featuredPost = BLOG_POSTS[0];

  return (
    <PageShell ref={scope} className="flex flex-col items-center">
      {/* Header */}
      <div className="w-full mb-10" data-retro="header">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-2.5 h-2.5 bg-yellow-400 rounded-none animate-blink" />
          <span className="text-yellow-400 text-sm md:text-base tracking-widest uppercase font-mono">
            ENGINEERING_LOGS // PRODUCTION_ARCHITECTURES
          </span>
        </div>
        <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
          Dev Blogs & System Blueprints
        </h1>
        <p className="text-gray-300 text-lg md:text-xl max-w-4xl leading-relaxed">
          Deep-dive technical retrospectives, empirical benchmarks, and architectural designs extracted directly from high-throughput enterprise production systems.
        </p>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="w-full mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-sm font-mono border transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-yellow-400 text-[#00234b] border-yellow-400 font-bold shadow-[2px_2px_0px_0px_#ffffff]"
                  : "bg-gray-900/80 text-gray-300 border-gray-700 hover:border-yellow-400/60 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search articles & tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 font-mono"
          />
        </div>
      </div>

      {/* Featured Flagship Article */}
      {featuredPost && (
        <div
          data-retro="featured-card"
          className="w-full mb-14 bg-gradient-to-br from-gray-900 via-[#0a192f] to-gray-950 border-2 border-yellow-400 rounded-lg p-6 md:p-10 shadow-[6px_6px_0px_0px_#eab308] relative overflow-hidden"
        >
          {/* Retro Corner Accents */}
          <div className="absolute top-0 right-0 bg-yellow-400 text-[#00234b] font-mono font-bold text-xs px-3 py-1 uppercase tracking-wider">
            FEATURED BLUEPRINT
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-yellow-400 font-mono mb-4">
            <span>{featuredPost.date}</span>
            <span>•</span>
            <span>{featuredPost.readTime}</span>
            <span>•</span>
            <span className="text-gray-400">{featuredPost.author.name} ({featuredPost.author.role})</span>
          </div>

          <h2 className="text-white text-2xl md:text-4xl font-bold mb-4 hover:text-yellow-300 transition-colors">
            <Link to={`/blog/${featuredPost.slug}`}>
              {featuredPost.title}
            </Link>
          </h2>

          <p className="text-gray-300 text-base md:text-lg mb-6 leading-relaxed">
            {featuredPost.subtitle}
          </p>

          {/* Highlights & Live Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8 bg-black/40 p-4 rounded border border-gray-800">
            {featuredPost.stats.map((stat, idx) => (
              <div key={idx} className="text-center p-2">
                <div className="text-xl md:text-2xl font-bold text-yellow-400 font-mono">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Tags & Action */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-800">
            <div className="flex flex-wrap gap-2">
              {featuredPost.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-blue-950/80 text-blue-300 border border-blue-700/60 rounded text-xs font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <Link
              to={`/blog/${featuredPost.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-[#00234b] font-bold text-base rounded hover:bg-yellow-300 transition-colors shadow-[2px_2px_0px_0px_#ffffff]"
            >
              <span>Read Full Deep-Dive</span>
              <img src={ArrowRight} alt="" className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}

      {/* Architecture Highlights & Core Subsystems Grid */}
      <div className="w-full mb-14">
        <h3 className="text-yellow-400 text-xl md:text-2xl font-bold mb-6 font-mono flex items-center gap-2">
          <span>[</span>
          <span>ENTERPRISE SUBSYSTEMS ANALYZED</span>
          <span>]</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            data-retro="topic-card"
            className="bg-gray-900/90 border border-gray-700 hover:border-yellow-400 p-6 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
                DISTRIBUTED WORKERS
              </span>
              <span className="text-xs text-gray-500 font-mono">Job Scheduling Service</span>
            </div>
            <h4 className="text-white text-xl font-bold mb-2">
              Streaq & Redis Sorted Set Scheduling
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Millisecond-accurate cron scheduling with deterministic task ID hashing (<code>_deterministic_id</code>), atomic ZSET leasing, and dynamic schedule re-registration without restarting worker daemons.
            </p>
            <div className="text-xs font-mono text-yellow-500">
              Services: Streaq Worker • Job Dispatcher
            </div>
          </div>

          <div
            data-retro="topic-card"
            className="bg-gray-900/90 border border-gray-700 hover:border-yellow-400 p-6 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800">
                HIGH AVAILABILITY
              </span>
              <span className="text-xs text-gray-500 font-mono">Failover Service</span>
            </div>
            <h4 className="text-white text-xl font-bold mb-2">
              Postgres Advisory Lock Failover Watchdog
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Autonomous 90-second watchdog monitoring Redis and worker health. Trips into APScheduler with session-level advisory locks (<code>pg_try_advisory_lock</code>) and auto-recovers back to Streaq with zero dual-execution.
            </p>
            <div className="text-xs font-mono text-yellow-500">
              Services: Job Failover • Scheduler Leader
            </div>
          </div>

          <div
            data-retro="topic-card"
            className="bg-gray-900/90 border border-gray-700 hover:border-yellow-400 p-6 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800">
                REAL-TIME MESSAGING
              </span>
              <span className="text-xs text-gray-500 font-mono">Messaging Service</span>
            </div>
            <h4 className="text-white text-xl font-bold mb-2">
              24-Hour WhatsApp Session Window & Pub/Sub
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Meta customer care session gating (freeform AiSensy vs approved Pi Commerce templates), S3 presigned media uploads, and sub-45s telecaller presence tracking with atomic SQL <code>ON CONFLICT</code> upserts.
            </p>
            <div className="text-xs font-mono text-yellow-500">
              Services: WhatsApp Chat • Redis Pub/Sub
            </div>
          </div>

          <div
            data-retro="topic-card"
            className="bg-gray-900/90 border border-gray-700 hover:border-yellow-400 p-6 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded border border-purple-800">
                DOCUMENT SSR
              </span>
              <span className="text-xs text-gray-500 font-mono">SSR Document Pipeline</span>
            </div>
            <h4 className="text-white text-xl font-bold mb-2">
              Transactional Advisory Locking & PDF Pipeline
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Collision-free sequential invoice generation via <code>pg_advisory_xact_lock</code>, Indian statutory GST tax splitting, CSS Paged Media A4 formatting, and Starlette threadpool offloading to preserve event loop throughput.
            </p>
            <div className="text-xs font-mono text-yellow-500">
              Services: Invoice Service • Document PDF Service
            </div>
          </div>
        </div>
      </div>

      {/* Filtered Articles List */}
      <div className="w-full mb-12">
        <h3 className="text-white text-2xl font-bold mb-6 font-mono">
          All Articles ({filteredPosts.length})
        </h3>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-800">
            <p className="text-gray-400 text-lg">No articles found matching your criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-yellow-400 text-[#00234b] font-bold rounded"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <article
                key={post.slug}
                data-retro="post-card"
                className="bg-gray-900/70 border border-gray-700/80 hover:border-yellow-400/80 p-6 md:p-8 rounded-lg transition-all duration-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm text-yellow-400/90 font-mono mb-2">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>

                <h4 className="text-white text-xl md:text-2xl font-bold mb-3 hover:text-yellow-300">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h4>

                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
                  {post.summary}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 font-mono text-sm font-semibold"
                  >
                    <span>Read Article</span>
                    <img src={ArrowRight} alt="" className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* PageNav */}
      <PageNav
        prev={{ to: "/skills", label: "Skills" }}
        next={{ to: "/contact", label: "Contact" }}
      />
    </PageShell>
  );
}
