import { Link } from "react-router-dom";
import ArrowRight from "./assets/images/arrow-right.png";
import { gsap, STEPS, prefersReducedMotion } from "../lib/retro";

/**
 * Previous / next links shared by the About, Projects and Skills pages.
 * Both sides are optional so the ends of the tour can omit one.
 */
export default function PageNav({ prev, next }) {
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
