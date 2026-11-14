import { Link } from "react-router-dom";
import ArrowRight from "./assets/images/arrow-right.png";
import { gsap, STEPS, prefersReducedMotion } from "../lib/retro";

/**
 * Previous / next links shared across pages, with integrated Blog navigation.
 * All sides are customizable or optional.
 */
export default function PageNav({
	prev,
	next,
	blog = { to: "/blog", label: "Blog" },
}) {
	// The arrow steps toward the direction of travel, like a menu cursor.
	const nudge = (direction) => (event) => {
		if (prefersReducedMotion()) return;
		const arrow = event.currentTarget.querySelector("img");
		if (arrow) {
			gsap.to(arrow, { x: direction * 3, duration: 0.12, ease: STEPS.bob });
		}
	};

	const reset = (event) => {
		if (prefersReducedMotion()) return;
		const arrow = event.currentTarget.querySelector("img");
		if (arrow) {
			gsap.to(arrow, { x: 0, duration: 0.12, ease: STEPS.bob });
		}
	};

	return (
		<div className="w-full mt-16 flex items-center justify-between gap-4">
			{prev ? (
				<Link
					to={prev.to}
					onMouseEnter={nudge(-1)}
					onMouseLeave={reset}
					className="flex items-center gap-2 py-2 min-h-[44px] text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
				>
					<img src={ArrowRight} alt="" className="w-6 h-6 rotate-180" />
					<span className="text-lg md:text-xl">{prev.label}</span>
				</Link>
			) : (
				<span />
			)}

			{blog ? (
				<Link
					to={blog.to}
					className="flex items-center gap-1.5 px-3 py-1.5 border border-yellow-400/50 rounded bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 hover:border-yellow-400 transition-colors duration-200 text-sm md:text-base font-mono font-semibold"
				>
					<span>[ {blog.label.toUpperCase()} ]</span>
				</Link>
			) : (
				<span />
			)}

			{next ? (
				<Link
					to={next.to}
					onMouseEnter={nudge(1)}
					onMouseLeave={reset}
					className="flex items-center gap-2 py-2 min-h-[44px] text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
				>
					<span className="text-lg md:text-xl">{next.label}</span>
					<img src={ArrowRight} alt="" className="w-6 h-6" />
				</Link>
			) : (
				<span />
			)}
		</div>
	);
}
