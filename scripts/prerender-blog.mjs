import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const buildDir = path.resolve(rootDir, "build");

async function prerender() {
	console.log("🚀 Starting static pre-rendering for Developer Blogs...");

	const templatePath = path.join(buildDir, "index.html");
	if (!fs.existsSync(templatePath)) {
		console.error("❌ Error: build/index.html not found! Run react-scripts build first.");
		process.exit(1);
	}

	const templateHtml = fs.readFileSync(templatePath, "utf-8");

	// Import blog posts data
	const blogPostsPath = path.join(rootDir, "src", "data", "blogPosts.js");
	const blogPostsUrl = pathToFileURL(blogPostsPath).href;
	const { BLOG_POSTS } = await import(blogPostsUrl);

	console.log(`📚 Found ${BLOG_POSTS.length} blog post(s) to pre-render.`);

	// Helper to replace or insert meta tags
	function injectMeta(html, { title, description, url, image, type = "website", author = "Muhammed Adnaan" }) {
		let updated = html;

		// Replace Title
		updated = updated.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

		// Replace or add description
		if (updated.includes('<meta name="description"')) {
			updated = updated.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
		} else {
			updated = updated.replace("</head>", `\t\t<meta name="description" content="${escapeHtml(description)}" />\n\t</head>`);
		}

		// Update canonical
		if (updated.includes('<link rel="canonical"')) {
			updated = updated.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${url}" />`);
		}

		// OpenGraph tags
		const ogTags = `
		<!-- Social OpenGraph Tags (LinkedIn, WhatsApp, Facebook) -->
		<meta property="og:type" content="${type}" />
		<meta property="og:url" content="${url}" />
		<meta property="og:title" content="${escapeHtml(title)}" />
		<meta property="og:description" content="${escapeHtml(description)}" />
		<meta property="og:image" content="${image}" />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta property="og:image:alt" content="${escapeHtml(title)}" />
		<meta property="og:site_name" content="Muhammed Adnaan Portfolio" />
		${type === "article" ? `<meta property="article:author" content="${author}" />\n\t\t<meta property="article:published_time" content="2026-11-01" />` : ""}

		<!-- Twitter Card Tags -->
		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:url" content="${url}" />
		<meta property="twitter:title" content="${escapeHtml(title)}" />
		<meta property="twitter:description" content="${escapeHtml(description)}" />
		<meta property="twitter:image" content="${image}" />
		`;

		// Strip existing generic og: and twitter: tags from head
		updated = updated.replace(/<meta\s+property="(og|twitter):.*?"\s+content=".*?"\s*\/?>\s*/gi, "");

		// Insert clean tags right before </head>
		updated = updated.replace("</head>", `${ogTags}\n\t</head>`);

		return updated;
	}

	function escapeHtml(str) {
		return String(str || "")
			.replace(/&/g, "&amp;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	}

	// 1. Pre-render Blog Index: /blog
	const blogIndexDir = path.join(buildDir, "blog");
	fs.mkdirSync(blogIndexDir, { recursive: true });

	const blogIndexMeta = {
		title: "Developer Blogs & Technical Notes — Muhammed Adnaan",
		description: "Deep-dive technical retrospectives on distributed job scheduling, multi-channel real-time notifications, server-side document rendering, and production engineering.",
		url: "https://muhammed-adnaan.pages.dev/blog",
		image: "https://muhammed-adnaan.pages.dev/og-enterprise-resiliency.png",
		type: "website",
	};

	let blogIndexHtml = injectMeta(templateHtml, blogIndexMeta);

	// Pre-render content inside <div id="root">
	const blogIndexContent = `
		<div id="root">
			<main style="background-color: #00234b; min-height: 100vh; color: #f8fafc; font-family: system-ui, sans-serif; padding: 40px 20px;">
				<div style="max-width: 1000px; margin: 0 auto;">
					<header style="margin-bottom: 40px;">
						<span style="color: #38bdf8; font-family: monospace; font-size: 14px; text-transform: uppercase;">[ ENGINEERING LOGS & ARCHITECTURE ]</span>
						<h1 style="color: #FACC15; font-size: 40px; margin: 10px 0;">Developer Blogs & Technical Retrospectives</h1>
						<p style="color: #94a3b8; font-size: 18px; max-width: 800px; line-height: 1.6;">
							Real-world architectural deep-dives from enterprise production: distributed task workers, self-healing failover watchdogs, and asynchronous SSR rendering.
						</p>
					</header>
					<section style="display: grid; gap: 30px;">
						${BLOG_POSTS.map(post => `
							<article style="background: rgba(15, 23, 42, 0.9); border: 1px solid #334155; padding: 25px; border-radius: 8px;">
								<div style="display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap;">
									${post.tags.map(t => `<span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-family: monospace;">${escapeHtml(t)}</span>`).join("")}
								</div>
								<h2 style="margin: 0 0 10px 0; font-size: 24px;">
									<a href="/blog/${post.slug}" style="color: #ffffff; text-decoration: none;">${escapeHtml(post.title)}</a>
								</h2>
								<p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
									${escapeHtml(post.summary)}
								</p>
								<div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #94a3b8; font-family: monospace;">
									<span>${escapeHtml(post.author.name)} • ${escapeHtml(post.date)}</span>
									<a href="/blog/${post.slug}" style="color: #FACC15; font-weight: bold; text-decoration: none;">READ POST →</a>
								</div>
							</article>
						`).join("")}
					</section>
				</div>
			</main>
		</div>
	`;

	blogIndexHtml = blogIndexHtml.replace('<div id="root"></div>', blogIndexContent.trim());
	fs.writeFileSync(path.join(blogIndexDir, "index.html"), blogIndexHtml);
	console.log("✅ Pre-rendered /blog -> build/blog/index.html");

	// 2. Pre-render Individual Blog Posts: /blog/[slug]
	for (const post of BLOG_POSTS) {
		const postDir = path.join(blogIndexDir, post.slug);
		fs.mkdirSync(postDir, { recursive: true });

		const postMeta = {
			title: post.title,
			description: post.summary,
			url: `https://muhammed-adnaan.pages.dev/blog/${post.slug}`,
			image: "https://muhammed-adnaan.pages.dev/og-enterprise-resiliency.png",
			type: "article",
			author: post.author.name,
		};

		let postHtml = injectMeta(templateHtml, postMeta);

		// Pre-rendered semantic HTML inside <div id="root">
		const postContent = `
		<div id="root">
			<article style="background-color: #00234b; min-height: 100vh; color: #f8fafc; font-family: system-ui, sans-serif; padding: 50px 20px;">
				<div style="max-width: 900px; margin: 0 auto;">
					<nav style="margin-bottom: 30px;">
						<a href="/blog" style="color: #FACC15; font-family: monospace; font-weight: bold; text-decoration: none;">← BACK TO ALL POSTS</a>
					</nav>
					<header style="border-bottom: 1px solid #1e3a5f; padding-bottom: 30px; margin-bottom: 40px;">
						<div style="display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap;">
							${post.tags.map(t => `<span style="background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-family: monospace;">${escapeHtml(t)}</span>`).join("")}
						</div>
						<h1 style="color: #ffffff; font-size: 36px; line-height: 1.3; margin: 0 0 15px 0;">${escapeHtml(post.title)}</h1>
						<p style="color: #94a3b8; font-size: 18px; line-height: 1.6; margin-bottom: 25px;">${escapeHtml(post.subtitle)}</p>
						<div style="display: flex; align-items: center; justify-content: space-between; font-size: 14px; color: #64748b; font-family: monospace;">
							<span>By ${escapeHtml(post.author.name)} (${escapeHtml(post.author.role)}) • ${escapeHtml(post.date)}</span>
							<span>${escapeHtml(post.readTime)}</span>
						</div>
					</header>

					<!-- Stats Bar -->
					<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 40px;">
						${post.stats.map(s => `
							<div style="background: #0f172a; border: 1px solid #1e293b; padding: 15px; border-radius: 6px; text-align: center;">
								<div style="color: #FACC15; font-size: 20px; font-weight: bold; font-family: monospace;">${escapeHtml(s.value)}</div>
								<div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-top: 5px;">${escapeHtml(s.label)}</div>
							</div>
						`).join("")}
					</div>

					<!-- Sections Body -->
					<div style="line-height: 1.8; font-size: 16px; color: #cbd5e1;">
						${post.sections.map(sec => `
							<section id="${sec.id}" style="margin-bottom: 50px;">
								<h2 style="color: #FACC15; font-size: 26px; margin: 0 0 15px 0; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">${escapeHtml(sec.title)}</h2>
								${sec.lead ? `<p style="font-size: 17px; color: #e2e8f0; font-weight: 500; margin-bottom: 20px;">${escapeHtml(sec.lead)}</p>` : ""}
								${sec.diagram ? `<pre style="background: #0f172a; border: 1px solid #334155; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 12px; color: #38bdf8;">${escapeHtml(sec.diagram)}</pre>` : ""}
								<div style="white-space: pre-line;">${escapeHtml(sec.content)}</div>
							</section>
						`).join("")}
					</div>
				</div>
			</article>
		</div>
		`;

		postHtml = postHtml.replace('<div id="root"></div>', postContent.trim());
		fs.writeFileSync(path.join(postDir, "index.html"), postHtml);
		console.log(`✅ Pre-rendered /blog/${post.slug} -> build/blog/${post.slug}/index.html`);
	}

	console.log("🎉 Static pre-rendering & OpenGraph generation complete!");
}

prerender().catch(err => {
	console.error("❌ Pre-rendering failed:", err);
	process.exit(1);
});
