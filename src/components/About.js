import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import instaicon from "./assets/images/socialIcon/instagram.png";
import linkedinicon from "./assets/images/socialIcon/linkedin.png";
import github from "./assets/images/socialIcon/github.png";
import PageNav from "./PageNav";
import PageShell from "./PageShell";

const SOCIALS = [
	{
		href: "https://github.com/Muhammed-Adnaan/",
		icon: github,
		label: "GitHub",
	},
	{
		href: "https://linkedin.com/in/muhammed-adnaan-ur-rahmaan/",
		icon: linkedinicon,
		label: "LinkedIn",
	},
	{
		href: "https://www.instagram.com/zen.adddy_/",
		icon: instaicon,
		label: "Instagram",
	},
];

export default function About() {
	const phrases = useMemo(
		() => ["Software Engineer", "Web Developer", "Weeb"],
		[]
	);

	const [displayedText, setDisplayedText] = useState("");
	const [phraseIndex, setPhraseIndex] = useState(0);
	const [charIndex, setCharIndex] = useState(0);
	const [isTyping, setIsTyping] = useState(true);

	useEffect(() => {
		const currentPhrase = phrases[phraseIndex];

		// One timer per step, so the cleanup below always cancels the pending work.
		let delay;
		let step;

		if (isTyping && charIndex < currentPhrase.length) {
			delay = 100;
			step = () => {
				setDisplayedText(currentPhrase.substring(0, charIndex + 1));
				setCharIndex((prev) => prev + 1);
			};
		} else if (isTyping) {
			delay = 1500; // hold the finished phrase before deleting
			step = () => setIsTyping(false);
		} else if (charIndex > 0) {
			delay = 50; // delete faster than we type
			step = () => {
				setDisplayedText(currentPhrase.substring(0, charIndex - 1));
				setCharIndex((prev) => prev - 1);
			};
		} else {
			delay = 200;
			step = () => {
				setPhraseIndex((prev) => (prev + 1) % phrases.length);
				setIsTyping(true);
			};
		}

		const timeoutId = setTimeout(step, delay);
		return () => clearTimeout(timeoutId);
	}, [charIndex, isTyping, phraseIndex, phrases]);

	return (
		<PageShell className="flex flex-col justify-center items-start">
			<div className="flex flex-col gap-4">
				<h1 className="pixelify-sans text-white text-4xl md:text-6xl leading-tight">
					<span className="text-yellow-400">Hey,</span> I am Muhammed Adnaan Ur
					Rahmaan
				</h1>
				<div className="pixelify-sans text-white text-2xl md:text-4xl h-10 md:h-12 flex items-center">
					<span aria-live="polite">{displayedText}</span>
					<span className="animate-blink" aria-hidden="true">
						|
					</span>
				</div>
			</div>
			<div className="mt-[50px] text-2xl text-white">
				<span className="text-yellow-400">From :</span>
				📍Bengaluru, India
			</div>
			<div className="flex gap-4 mt-5">
				{SOCIALS.map((social) => (
					<a
						key={social.label}
						href={social.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={social.label}
						className="flex items-center justify-center h-11 w-11 hover:opacity-75 transition-opacity duration-300"
					>
						<img src={social.icon} alt="" />
					</a>
				))}
			</div>
			<Link
				to="/contact"
				className="mt-8 px-6 py-3 bg-yellow-400 text-[#00234b] rounded-lg font-bold text-xl hover:bg-yellow-300 transition-colors duration-300"
			>
				Get in touch
			</Link>
			<PageNav
				prev={{ to: "/", label: "Home" }}
				next={{ to: "/projects", label: "Projects" }}
			/>
		</PageShell>
	);
}
