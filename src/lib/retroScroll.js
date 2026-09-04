import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STEPS, PIXEL } from "./retro";

gsap.registerPlugin(ScrollTrigger);

/**
 * Reveals items as they scroll in. Batched so a long gallery costs one
 * observer per group rather than one per tile, which matters on phones.
 *
 * Tiles carry their own aspect ratio, so a lazy screenshot arriving later
 * doesn't resize anything and the triggers never need re-measuring.
 *
 * Lives apart from ./retro so ScrollTrigger only ships with the lazily
 * loaded routes that scroll, not in the initial bundle.
 */
export function revealOnScroll(selector, { stagger = 0.06 } = {}) {
	const items = gsap.utils.toArray(selector);
	if (!items.length) return;

	gsap.set(items, { opacity: 0, y: 14 });
	ScrollTrigger.batch(items, {
		start: "top 88%",
		once: true,
		onEnter: (batch) =>
			gsap.to(batch, {
				opacity: 1,
				y: 0,
				duration: 0.4,
				ease: STEPS.enter,
				stagger,
				snap: PIXEL,
			}),
	});
}

export { ScrollTrigger };
