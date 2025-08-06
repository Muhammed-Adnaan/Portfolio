import React, { useState, useEffect } from "react";
import instaicon from "./assets/images/socialIcon/instagram.png";
import linkedinicon from "./assets/images/socialIcon/linkedin.png";
import github from "./assets/images/socialIcon/github.png";
import { Link } from "react-router-dom";
import ArrowRight from "./assets/images/arrow-right.png";
export default function About() {
	// Array of phrases to animate
	const phrases = ["Software Engineer", "Web Developer", "Weeb"];

	// State to hold the currently displayed text
	const [displayedText, setDisplayedText] = useState("");
	// State to track the index of the current phrase in the 'phrases' array
	const [phraseIndex, setPhraseIndex] = useState(0);
	// State to track the index of the character being typed/deleted within the current phrase
	const [charIndex, setCharIndex] = useState(0);
	// State to determine if we are currently typing (true) or deleting (false)
	const [isTyping, setIsTyping] = useState(true);

	useEffect(() => {
		// Get the current phrase based on phraseIndex
		const currentPhrase = phrases[phraseIndex];
		let animationFrameId;

		const animate = () => {
			if (isTyping) {
				// Typing phase: Add characters one by one
				if (charIndex < currentPhrase.length) {
					setDisplayedText(currentPhrase.substring(0, charIndex + 1));
					setCharIndex((prev) => prev + 1);
					animationFrameId = requestAnimationFrame(animate); // Continue typing
				} else {
					// Phrase fully typed, pause then start deleting
					setTimeout(() => {
						setIsTyping(false); // Switch to deleting mode
					}, 1500); // Pause for 1.5 seconds after typing
				}
			} else {
				// Deleting phase: Remove characters one by one
				if (charIndex > 0) {
					setDisplayedText(currentPhrase.substring(0, charIndex - 1));
					setCharIndex((prev) => prev - 1);
					animationFrameId = requestAnimationFrame(animate); // Continue deleting
				} else {
					// Phrase fully deleted, move to next phrase and start typing
					setPhraseIndex((prev) => (prev + 1) % phrases.length); // Cycle through phrases
					setIsTyping(true); // Switch to typing mode
					// No need for setTimeout here, animation will restart immediately with new phrase
				}
			}
		};

		// Start the animation loop
		const timeoutId = setTimeout(animate, isTyping ? 100 : 50); // Faster deletion than typing

		// Cleanup function for useEffect
		return () => {
			clearTimeout(timeoutId); // Clear the timeout
			cancelAnimationFrame(animationFrameId); // Cancel any pending animation frame
		};
	}, [charIndex, isTyping, phraseIndex, phrases]); // Re-run effect when these states change

	return (
		<div className="pixelify-sans bg-[#00234b] min-h-screen w-full flex flex-col justify-center items-start p-8 md:p-[100px] font-inter">
			<div className="flex flex-col gap-4">
				{" "}
				{/* Added a flex container for text */}
				<div className="pixelify-sans text-white text-4xl md:text-6xl leading-tight">
					<span className="text-yellow-400">Hey,</span> I am Muhammed Adnaan Ur
					Rahmaan
				</div>
				<div className="pixelify-sans text-white text-2xl md:text-4xl h-10 md:h-12 flex items-center">
					{displayedText}
					{/* Blinking cursor for typing effect */}
					<span className="animate-blink">|</span>
				</div>
			</div>
			<div className="mt-[50px] text-2xl text-white">
				<span className="text-yellow-400">From :</span>
				📍Bengaluru, India
			</div>
			<div className="flex gap-4 mt-5">
				<div>
					<Link to="https://www.instagram.com/zen.adddy_/#">
						<img src={instaicon} alt="Portfolio"></img>
					</Link>
				</div>
				<div>
					<Link to="https://linkedin.com/in/muhammed-adnaan-ur-rahmaan/">
						<img src={linkedinicon} alt="Portfolio" className=""></img>
					</Link>
				</div>
				<div>
					<Link to="https://github.com/Muhammed-Adnaan/">
						<img src={github} alt="Portfolio"></img>
					</Link>
				</div>
				<Link
					className="scale-50 absolute bottom-[5%] right-[45%]  opacity-10 hover:opacity-75 transition-opacity duration-500"
					to="/projects"
				>
					<img src={ArrowRight} alt="right"></img>
				</Link>
				<Link
					className="scale-50 rotate-180 absolute bottom-[5%] right-[50%] opacity-10 hover:opacity-75 transition-opacity duration-500"
					to="/"
				>
					<img src={ArrowRight} alt="right"></img>
				</Link>
			</div>
		</div>
	);
}
