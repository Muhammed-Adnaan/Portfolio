import React, { useEffect, useCallback } from "react";
import { audioEngine } from "../lib/audioEngine";

export default function AchievementBanner({ onClose }) {
	const handleClose = useCallback(() => {
		audioEngine.playPowerup();
		onClose();
	}, [onClose]);

	useEffect(() => {
		const onKeyDown = (e) => {
			if (e.key === "Escape" || e.code === "Space" || e.code === "Enter") {
				e.preventDefault();
				handleClose();
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [handleClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none"
			role="dialog"
			aria-modal="true"
			aria-label="Secret Achievement Unlocked"
		>
			<div className="relative max-w-md w-full bg-[#03152d] border-4 border-yellow-400 p-6 text-center shadow-[0_0_30px_rgba(250,204,21,0.4)] animate-bounce-once">
				{/* Top Trophy Icon */}
				<div className="text-5xl mb-2 animate-bounce">🏆</div>

				<h2 className="pixelify-sans text-yellow-400 text-2xl sm:text-3xl font-bold tracking-wider mb-1">
					MASTER EXPLORER!
				</h2>
				<p className="text-cyan-300 font-mono text-xs sm:text-sm font-bold uppercase tracking-widest mb-3">
					★ ALL 5 SECRET RELICS FOUND ★
				</p>

				<div className="bg-[#000d1e] border border-yellow-500/40 p-3 mb-4 rounded font-mono text-xs sm:text-sm text-yellow-100 leading-relaxed">
					<p className="mb-2">
						You discovered every ancient relic hidden inside the developer
						matrix!
					</p>
					<p className="text-emerald-400 font-bold">
						⚡ PERMANENT PERK UNLOCKED: Rainbow Sprint Aura!
					</p>
				</div>

				<div className="flex justify-center gap-2 mb-4 text-2xl">
					<span>💎</span>
					<span>🔮</span>
					<span>🪙</span>
					<span>🔷</span>
					<span>⭐</span>
				</div>

				<button
					type="button"
					onClick={handleClose}
					className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-[#00234b] font-bold font-mono text-sm sm:text-base border-2 border-yellow-200 shadow-lg"
				>
					CLAIM REWARD & KEEP EXPLORING ▸
				</button>
			</div>
		</div>
	);
}
