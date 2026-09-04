import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Retro-game motion vocabulary.
 *
 * Old consoles animated on a low frame budget, so movement landed on whole
 * pixels a few frames at a time rather than gliding. Stepped easing plus
 * snapped pixel values is what gives these transitions their arcade feel;
 * keep the distances small so it stays a texture rather than an effect.
 */
export const STEPS = {
	enter: "steps(5)",
	quick: "steps(3)",
	bob: "steps(2)",
};

export const PIXEL = { x: 1, y: 1 };

/**
 * Elements animated here must not also carry a CSS transition on opacity or
 * transform (`transition-opacity`, `transition-all`, ...). GSAP writes those
 * properties inline every frame, and the CSS transition re-animates each
 * write, which leaves the element stuck at its start value. Use
 * `transition-colors` or `transition-[filter]` for hover states instead.
 */
export function prefersReducedMotion() {
	return (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

/**
 * Runs `build` inside a GSAP context scoped to the returned ref, so every
 * tween and ScrollTrigger it creates is reverted on unmount. Skips entirely
 * when the visitor asked for reduced motion, which leaves the markup in its
 * natural, fully visible state.
 */
export function useRetro(build, deps = []) {
	const scope = useRef(null);

	useLayoutEffect(() => {
		if (!scope.current || prefersReducedMotion()) {
			return undefined;
		}
		const ctx = gsap.context(build, scope);
		return () => ctx.revert();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	return scope;
}

/** Headline and lead copy stepping up into place on mount. */
export function enterHeader(selector = "[data-retro='header'] > *") {
	gsap.from(selector, {
		opacity: 0,
		y: 12,
		duration: 0.45,
		ease: STEPS.enter,
		stagger: 0.07,
		snap: PIXEL,
	});
}

/** Menu-style stagger: items land one after another like a loading roster. */
export function enterList(selector, { stagger = 0.05, y = 10, delay = 0 } = {}) {
	gsap.from(selector, {
		opacity: 0,
		y,
		duration: 0.4,
		ease: STEPS.enter,
		stagger,
		delay,
		snap: PIXEL,
	});
}

/** Slow two-frame sprite bob. Amplitude stays tiny so it reads as idle life. */
export function spriteBob(selector, { amount = 3, stagger = 0.18 } = {}) {
	gsap.to(selector, {
		y: -amount,
		duration: 0.9,
		ease: STEPS.bob,
		repeat: -1,
		yoyo: true,
		stagger,
	});
}

export { gsap };
