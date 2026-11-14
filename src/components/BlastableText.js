import { useId } from "react";

/**
 * BlastableText Component
 * Splits text into individual character spans tagged with data-blastable="true".
 * When an alphabet projectile hits a character (e.g. in "Instagram", "GitHub", "Get in touch"),
 * the letter is detached and tumbles down the page with gravity!
 */
export default function BlastableText({ text, className = "", as: Component = "span" }) {
	const baseId = useId();

	if (!text) return null;

	return (
		<Component className={className}>
			{text.split("").map((char, index) => (
				<span
					key={`${baseId}-${index}`}
					data-blastable="true"
					data-char={char}
					className="inline-block transition-opacity duration-200 select-none"
					style={{ willChange: "transform, opacity" }}
				>
					{char === " " ? "\u00A0" : char}
				</span>
			))}
		</Component>
	);
}
