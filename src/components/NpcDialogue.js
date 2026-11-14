import React, { useState, useEffect, useCallback } from "react";
import { audioEngine } from "../lib/audioEngine";

export default function NpcDialogue({ allRelicsFound, onClose }) {
	const dialogues = [
		"BEEP BOOP! I'm Byte, Adnaan's digital robot mascot! 🤖 Welcome to the Secret Hub World!",
		"PRO-TIP: Hold [SHIFT] on desktop or hold [B] on mobile to DASH with speed trails! ⚡",
		"MISSION: There are 5 hidden Easter Egg Relics scattered in this room. Collect them all to unlock a secret developer achievement!",
		"See that arcade cabinet over on the right wall? Walk up and press [E / SPACE] to play Bug Buster 1984!",
		"SECRET SHORTCUT: You can jump back into this secret hub anytime from any page by tapping [SHIFT] 3 times or double-tapping on mobile!",
		"Enjoying the journey? Walk through the doors to explore About, Projects, Skills, Resume, and Contact!",
	];

	if (allRelicsFound) {
		dialogues.unshift(
			"★ INCREDIBLE! You discovered all 5 hidden developer relics! You are officially an Elite Full-Stack Master! Byte salutes you! 🏆✨"
		);
	}

	const [dialogIndex, setDialogIndex] = useState(0);
	const [displayedText, setDisplayedText] = useState("");
	const [isTyping, setIsTyping] = useState(true);

	const fullText = dialogues[dialogIndex];

	// Typewriter effect
	useEffect(() => {
		setDisplayedText("");
		setIsTyping(true);
		let i = 0;
		let audioCounter = 0;

		const timer = setInterval(() => {
			if (i < fullText.length) {
				setDisplayedText(fullText.slice(0, i + 1));
				i++;
				audioCounter++;
				if (audioCounter % 3 === 0) {
					audioEngine.playDialogue();
				}
			} else {
				setIsTyping(false);
				clearInterval(timer);
			}
		}, 20);

		return () => clearInterval(timer);
	}, [dialogIndex, fullText]);

	const advance = useCallback(() => {
		if (isTyping) {
			// Instant finish current line
			setDisplayedText(fullText);
			setIsTyping(false);
			return;
		}
		if (dialogIndex < dialogues.length - 1) {
			audioEngine.playInteract();
			setDialogIndex((prev) => prev + 1);
		} else {
			onClose();
		}
	}, [isTyping, dialogIndex, dialogues.length, fullText, onClose]);

	useEffect(() => {
		const onKeyDown = (e) => {
			if (e.code === "Space" || e.code === "Enter" || e.code === "KeyE") {
				e.preventDefault();
				advance();
			} else if (e.code === "Escape") {
				e.preventDefault();
				onClose();
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [advance, onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-[2px] select-none"
			role="dialog"
			aria-modal="true"
			aria-label="Byte NPC Dialogue"
		>
			<div className="relative w-full max-w-xl bg-[#001a38] border-4 border-yellow-400 p-4 sm:p-5 shadow-2xl rounded-sm">
				{/* Top bar */}
				<div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-yellow-500/30">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-yellow-400 border border-yellow-200 flex items-center justify-center text-lg animate-bounce">
							🤖
						</div>
						<div>
							<h3 className="pixelify-sans text-yellow-400 text-lg font-bold leading-none">
								BYTE THE BOT
							</h3>
							<p className="text-[10px] text-yellow-200/70 font-mono">
								DEV MASCOT & GUIDE
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="px-2 py-1 text-xs font-mono bg-red-600/80 hover:bg-red-500 text-white font-bold"
					>
						✕ CLOSE
					</button>
				</div>

				{/* Dialogue Box Text */}
				<div className="min-h-[64px] sm:min-h-[72px] text-white font-mono text-xs sm:text-sm leading-relaxed p-2 bg-[#000f24] border border-cyan-500/40 rounded">
					{displayedText}
					{isTyping && <span className="text-yellow-400 animate-pulse">▍</span>}
				</div>

				{/* Footer buttons */}
				<div className="flex items-center justify-between mt-3 pt-2">
					<span className="text-[11px] text-yellow-300/70 font-mono">
						PAGE {dialogIndex + 1} / {dialogues.length}
					</span>
					<button
						type="button"
						onClick={advance}
						className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-[#00234b] font-bold text-xs sm:text-sm font-mono border border-yellow-200 shadow-md active:scale-95"
					>
						{dialogIndex < dialogues.length - 1 ? "NEXT ▸" : "AWESOME ✕"}
					</button>
				</div>
			</div>
		</div>
	);
}
