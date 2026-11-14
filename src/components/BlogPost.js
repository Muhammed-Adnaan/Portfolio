import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PageShell from "./PageShell";
import PageNav from "./PageNav";
import { useRetro, enterHeader } from "../lib/retro";
import { revealOnScroll } from "../lib/retroScroll";
import { getBlogPost, BLOG_POSTS } from "../data/blogPosts";
import ArrowLeft from "./assets/images/arrow-right.png";

export default function BlogPost() {
  const { slug } = useParams();
  const post = getBlogPost(slug) || BLOG_POSTS[0];

  const [copiedId, setCopiedId] = useState(null);
  const [activeSection, setActiveSection] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll progress listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scope = useRetro(() => {
    enterHeader("[data-retro='header'] > *");
    revealOnScroll("[data-retro='section-block']", { stagger: 0.08 });
    revealOnScroll("[data-retro='callout-box']", { stagger: 0.05 });
  });

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <PageShell ref={scope} className="relative">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-50 bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-300 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Back to Blog */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/blog"
          className="flex items-center gap-2 py-2 min-h-[44px] text-yellow-400 hover:text-yellow-300 transition-colors duration-200 font-mono text-base"
        >
          <img src={ArrowLeft} alt="Back" className="w-5 h-5 rotate-180" />
          <span>&larr; BACK TO DEV BLOGS</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="mb-12 border-b border-gray-800 pb-10" data-retro="header">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-2.5 py-1 bg-yellow-400 text-[#00234b] font-bold text-xs uppercase font-mono rounded">
            CASE STUDY
          </span>
          <span className="text-gray-400 text-sm font-mono">•</span>
          <span className="text-yellow-400 text-sm font-mono">{post.date}</span>
          <span className="text-gray-400 text-sm font-mono">•</span>
          <span className="text-gray-300 text-sm font-mono">{post.readTime}</span>
        </div>

        <h1 className="text-white text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
          {post.title}
        </h1>

        <p className="text-gray-300 text-lg md:text-2xl leading-relaxed max-w-5xl mb-8 font-light">
          {post.subtitle}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-900 border border-gray-700 text-yellow-400 rounded-full text-xs font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Author & System Specs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-gray-900/60 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-400 text-[#00234b] flex items-center justify-center font-bold font-mono text-lg">
              {post.author.avatar}
            </div>
            <div>
              <div className="text-white font-bold text-base font-mono">
                {post.author.name}
              </div>
              <div className="text-gray-400 text-xs font-mono">
                {post.author.role} • Production Retrospective
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded border border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>VERIFIED IN PRODUCTION: ENTERPRISE DISTRIBUTED ERP</span>
          </div>
        </div>
      </header>

      {/* Main Grid: Table of Contents & Article Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sticky Table of Contents Sidebar */}
        <aside className="lg:col-span-4 order-2 lg:order-1">
          <div className="sticky top-24 bg-gray-900/90 border border-gray-800 p-6 rounded-lg backdrop-blur shadow-lg">
            <h3 className="text-yellow-400 font-mono font-bold text-sm tracking-wider uppercase mb-4 pb-2 border-b border-gray-800 flex items-center justify-between">
              <span>TABLE OF CONTENTS</span>
              <span className="text-xs text-gray-500 font-normal">[SECTIONS]</span>
            </h3>

            <nav className="space-y-2 font-mono text-xs md:text-sm">
              {post.sections.map((sec, idx) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={() => setActiveSection(sec.id)}
                  className={`block py-1.5 px-2 rounded transition-colors ${
                    activeSection === sec.id
                      ? "bg-yellow-400/20 text-yellow-300 font-bold border-l-2 border-yellow-400"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/40"
                  }`}
                >
                  <span className="text-yellow-500/80 mr-2">{idx + 1}.</span>
                  {sec.title.replace(/^\d+\.\s*/, "")}
                </a>
              ))}
            </nav>

            {/* Quick Metrics Widget */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">
                KEY PERFORMANCE METRICS
              </div>
              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="bg-black/40 p-2 rounded border border-gray-800">
                  <div className="text-yellow-400 font-bold text-base">&lt; 90s</div>
                  <div className="text-[10px] text-gray-400">FAILOVER RTO</div>
                </div>
                <div className="bg-black/40 p-2 rounded border border-gray-800">
                  <div className="text-yellow-400 font-bold text-base">45,000+</div>
                  <div className="text-[10px] text-gray-400">DAILY TOUCHES</div>
                </div>
                <div className="bg-black/40 p-2 rounded border border-gray-800">
                  <div className="text-yellow-400 font-bold text-base">92 ms</div>
                  <div className="text-[10px] text-gray-400">P95 SSR PDF</div>
                </div>
                <div className="bg-black/40 p-2 rounded border border-gray-800">
                  <div className="text-yellow-400 font-bold text-base">0 ms</div>
                  <div className="text-[10px] text-gray-400">LOOP STALL</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <main className="lg:col-span-8 order-1 lg:order-2 space-y-16">
          {post.sections.map((sec) => (
            <section
              key={sec.id}
              id={sec.id}
              data-retro="section-block"
              className="scroll-mt-28"
            >
              <h2 className="text-white text-2xl md:text-4xl font-bold mb-4 pb-3 border-b border-gray-800 flex items-center justify-between">
                <span>{sec.title}</span>
                <a
                  href={`#${sec.id}`}
                  className="text-gray-600 hover:text-yellow-400 text-lg font-mono"
                  title="Direct Link"
                >
                  #
                </a>
              </h2>

              {sec.lead && (
                <p className="text-yellow-300/90 text-base md:text-lg font-medium leading-relaxed mb-6 bg-yellow-400/5 p-4 border-l-2 border-yellow-400 rounded-r">
                  {sec.lead}
                </p>
              )}

              {/* Render Section Diagram if available */}
              {sec.diagram && (
                <div className="my-6 bg-black/80 rounded-lg border border-gray-700 p-4 font-mono text-xs text-green-400 overflow-x-auto shadow-inner">
                  <div className="flex items-center justify-between text-gray-400 border-b border-gray-800 pb-2 mb-3">
                    <span className="uppercase text-[11px] tracking-widest text-yellow-400">
                      [ SYSTEM ARCHITECTURE TOPOLOGY ]
                    </span>
                    <button
                      onClick={() => copyToClipboard(sec.diagram, `diag-${sec.id}`)}
                      className="text-xs hover:text-white px-2 py-0.5 rounded bg-gray-800"
                    >
                      {copiedId === `diag-${sec.id}` ? "Copied!" : "Copy Topology"}
                    </button>
                  </div>
                  <pre className="leading-tight">{sec.diagram.trim()}</pre>
                </div>
              )}

              {/* Render Section Content */}
              <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4 text-base md:text-lg">
                {sec.content.split("\n\n").map((paragraph, pIdx) => {
                  const trimmed = paragraph.trim();

                  // Markdown Code block
                  if (trimmed.startsWith("```")) {
                    const lines = trimmed.split("\n");
                    const lang = lines[0].replace("```", "") || "python";
                    const codeContent = lines.slice(1, -1).join("\n");
                    const blockId = `code-${sec.id}-${pIdx}`;

                    return (
                      <div
                        key={pIdx}
                        className="my-6 rounded-lg overflow-hidden border border-gray-800 bg-gray-950 shadow-xl"
                      >
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 font-mono text-xs">
                          <span className="text-yellow-400 font-bold uppercase">
                            {lang}
                          </span>
                          <button
                            onClick={() => copyToClipboard(codeContent, blockId)}
                            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors text-xs"
                          >
                            {copiedId === blockId ? "Copied!" : "Copy Code"}
                          </button>
                        </div>
                        <pre className="p-4 font-mono text-xs md:text-sm text-gray-200 overflow-x-auto leading-relaxed">
                          <code>{codeContent}</code>
                        </pre>
                      </div>
                    );
                  }

                  // Heading 3
                  if (trimmed.startsWith("### ")) {
                    return (
                      <h3
                        key={pIdx}
                        className="text-white text-xl md:text-2xl font-bold mt-8 mb-3 font-mono text-yellow-400/90"
                      >
                        {trimmed.replace("### ", "")}
                      </h3>
                    );
                  }

                  // Table block
                  if (trimmed.includes("|")) {
                    const rows = trimmed
                      .split("\n")
                      .filter((r) => r.trim().startsWith("|") && !r.includes("---"));
                    return (
                      <div key={pIdx} className="my-6 overflow-x-auto">
                        <table className="w-full text-left font-mono text-xs md:text-sm border border-gray-700 bg-gray-900/60 rounded">
                          <tbody>
                            {rows.map((row, rIdx) => {
                              const cells = row
                                .split("|")
                                .map((c) => c.trim())
                                .filter((c) => c.length > 0);
                              return (
                                <tr
                                  key={rIdx}
                                  className={
                                    rIdx === 0
                                      ? "bg-gray-800 text-yellow-400 font-bold border-b border-gray-700"
                                      : "border-b border-gray-800/80 hover:bg-gray-800/30"
                                  }
                                >
                                  {cells.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-3">
                                      {cell.replace(/\*\*/g, "")}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  }

                  // List items
                  if (trimmed.startsWith("- ") || trimmed.startsWith("1. ")) {
                    const items = trimmed.split("\n");
                    return (
                      <ul key={pIdx} className="list-disc pl-6 space-y-2 text-gray-300">
                        {items.map((item, iIdx) => (
                          <li key={iIdx}>
                            {item.replace(/^-\s*|^\d+\.\s*/, "")}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  // Standard paragraph
                  return (
                    <p key={pIdx} className="leading-relaxed">
                      {trimmed}
                    </p>
                  );
                })}
              </div>

              {/* Callout Boxes */}
              {sec.callouts && sec.callouts.length > 0 && (
                <div className="mt-8 space-y-4">
                  {sec.callouts.map((callout, cIdx) => {
                    let borderClass = "border-yellow-500 bg-yellow-950/20";
                    let badgeClass = "bg-yellow-500 text-gray-950";
                    if (callout.type === "critical") {
                      borderClass = "border-red-500 bg-red-950/20";
                      badgeClass = "bg-red-500 text-white";
                    } else if (callout.type === "warning") {
                      borderClass = "border-amber-500 bg-amber-950/20";
                      badgeClass = "bg-amber-500 text-gray-950";
                    } else if (callout.type === "note") {
                      borderClass = "border-blue-500 bg-blue-950/20";
                      badgeClass = "bg-blue-500 text-white";
                    }

                    return (
                      <div
                        key={cIdx}
                        data-retro="callout-box"
                        className={`border-l-4 p-5 rounded-r-lg ${borderClass}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${badgeClass}`}
                          >
                            {callout.type}
                          </span>
                          <span className="text-white font-bold font-mono text-sm">
                            {callout.title}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                          {callout.body}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}

          {/* Author Bio Card */}
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-lg mt-16">
            <h3 className="text-yellow-400 font-mono text-sm uppercase tracking-wider mb-4">
              ABOUT THE AUTHOR
            </h3>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-yellow-400 text-[#00234b] flex items-center justify-center font-bold text-2xl font-mono shrink-0">
                MA
              </div>
              <div>
                <h4 className="text-white text-xl font-bold font-mono">
                  Muhammed Adnaan Ur Rahmaan
                </h4>
                <p className="text-gray-400 text-sm font-mono mb-3">
                  Software Engineer &amp; Distributed Systems Practitioner
                </p>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
                  Passionate about building highly available distributed architectures, asynchronous message queues, high-speed document engines, and resilient enterprise software systems.
                </p>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <Link to="/about" className="text-yellow-400 hover:underline">
                    About Me &rarr;
                  </Link>
                  <Link to="/projects" className="text-yellow-400 hover:underline">
                    Projects &rarr;
                  </Link>
                  <Link to="/contact" className="text-yellow-400 hover:underline">
                    Get in Touch &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* PageNav */}
      <PageNav
        prev={{ to: "/blog", label: "Dev Blogs" }}
        next={{ to: "/projects", label: "Projects" }}
      />
    </PageShell>
  );
}
