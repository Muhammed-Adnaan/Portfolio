import React, { useEffect, useRef, useState, useCallback } from "react";
import { audioEngine } from "../lib/audioEngine";

/**
 * CYBER BUG BUSTER - 1984
 * Retro Arcade Mini-Game inside HubWorld.
 */
const CANVAS_WIDTH = 240;
const CANVAS_HEIGHT = 180;

export default function ArcadeMiniGame({ onClose }) {
	const canvasRef = useRef(null);
	const [gameState, setGameState] = useState("start"); // "start", "playing", "gameover"
	const [score, setScore] = useState(0);
	const [highScore, setHighScore] = useState(() => {
		try {
			return parseInt(localStorage.getItem("bug_buster_high") || "0", 10);
		} catch (e) {
			return 0;
		}
	});
	const [lives, setLives] = useState(3);
	const [isMuted, setIsMuted] = useState(audioEngine.getMuted());

	// Game loop mutable state stored in ref for 60fps canvas loop
	const gameRef = useRef({
		state: "start",
		player: { x: 110, y: 155, width: 14, height: 10, speed: 120 },
		bullets: [],
		enemies: [],
		particles: [],
		pickups: [],
		floatingTexts: [],
		keys: { left: false, right: false, fire: false },
		lastShot: 0,
		lastSpawn: 0,
		score: 0,
		lives: 3,
		combo: 0,
		level: 1,
		spawnInterval: 1200,
	});

	// Sound toggle
	const toggleSound = () => {
		const muted = audioEngine.toggleMute();
		setIsMuted(muted);
	};

	const startGame = useCallback(() => {
		audioEngine.playPowerup();
		const g = gameRef.current;
		g.state = "playing";
		g.player.x = CANVAS_WIDTH / 2 - 7;
		g.bullets = [];
		g.enemies = [];
		g.particles = [];
		g.pickups = [];
		g.floatingTexts = [];
		g.score = 0;
		g.lives = 3;
		g.combo = 0;
		g.level = 1;
		g.spawnInterval = 1200;
		g.lastSpawn = performance.now();
		g.lastShot = 0;
		setScore(0);
		setLives(3);
		setGameState("playing");
	}, []);

	// Handle keyboard controls
	useEffect(() => {
		const onKeyDown = (e) => {
			const g = gameRef.current;
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
				return;
			}
			if (g.state === "start" || g.state === "gameover") {
				if (e.code === "Space" || e.code === "Enter" || e.code === "KeyE") {
					e.preventDefault();
					startGame();
					return;
				}
			}
			if (e.code === "ArrowLeft" || e.code === "KeyA") {
				g.keys.left = true;
				e.preventDefault();
			} else if (e.code === "ArrowRight" || e.code === "KeyD") {
				g.keys.right = true;
				e.preventDefault();
			} else if (e.code === "Space" || e.code === "KeyW" || e.code === "ArrowUp") {
				g.keys.fire = true;
				e.preventDefault();
			}
		};

		const onKeyUp = (e) => {
			const g = gameRef.current;
			if (e.code === "ArrowLeft" || e.code === "KeyA") {
				g.keys.left = false;
			} else if (e.code === "ArrowRight" || e.code === "KeyD") {
				g.keys.right = false;
			} else if (e.code === "Space" || e.code === "KeyW" || e.code === "ArrowUp") {
				g.keys.fire = false;
			}
		};

		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
		};
	}, [onClose, startGame]);

	// Main 60fps canvas game loop
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;

		let animId;
		let lastTime = performance.now();

		const loop = (now) => {
			const dt = Math.min((now - lastTime) / 1000, 0.05);
			lastTime = now;
			const g = gameRef.current;

			// UPDATE
			if (g.state === "playing") {
				// Player move
				if (g.keys.left) {
					g.player.x = Math.max(8, g.player.x - g.player.speed * dt);
				}
				if (g.keys.right) {
					g.player.x = Math.min(
						CANVAS_WIDTH - 8 - g.player.width,
						g.player.x + g.player.speed * dt
					);
				}

				// Player shooting
				if (g.keys.fire && now - g.lastShot > 180) {
					g.lastShot = now;
					audioEngine.playLaser();
					g.bullets.push({
						x: g.player.x + g.player.width / 2 - 1,
						y: g.player.y - 4,
						width: 2,
						height: 6,
						speed: 240,
					});
				}

				// Update Bullets
				for (let i = g.bullets.length - 1; i >= 0; i--) {
					const b = g.bullets[i];
					b.y -= b.speed * dt;
					if (b.y < -10) {
						g.bullets.splice(i, 1);
					}
				}

				// Spawn enemies
				if (now - g.lastSpawn > g.spawnInterval) {
					g.lastSpawn = now;
					const type = Math.random();
					if (type < 0.5) {
						// Syntax Error Bug (Red)
						g.enemies.push({
							type: "bug",
							x: 12 + Math.random() * (CANVAS_WIDTH - 36),
							y: -14,
							width: 12,
							height: 10,
							speed: 38 + Math.random() * 25,
							hp: 1,
							color: "#ef4444",
							score: 100,
							wiggle: Math.random() * Math.PI * 2,
						});
					} else if (type < 0.8) {
						// Memory Leak (Green Fast)
						g.enemies.push({
							type: "leak",
							x: 12 + Math.random() * (CANVAS_WIDTH - 36),
							y: -14,
							width: 10,
							height: 10,
							speed: 65 + Math.random() * 30,
							hp: 1,
							color: "#10b981",
							score: 150,
							wiggle: Math.random() * Math.PI * 2,
						});
					} else {
						// Glitch Boss (Purple Tough)
						g.enemies.push({
							type: "glitch",
							x: 12 + Math.random() * (CANVAS_WIDTH - 44),
							y: -16,
							width: 16,
							height: 12,
							speed: 28 + Math.random() * 15,
							hp: 2,
							color: "#a855f7",
							score: 300,
							wiggle: Math.random() * Math.PI * 2,
						});
					}

					// Occasional Coffee / Gem Powerup drop
					if (Math.random() < 0.18) {
						g.pickups.push({
							x: 16 + Math.random() * (CANVAS_WIDTH - 32),
							y: -10,
							width: 8,
							height: 8,
							speed: 32,
						});
					}

					// Slowly speed up spawn rate as score rises
					g.spawnInterval = Math.max(500, 1200 - Math.floor(g.score / 300) * 80);
				}

				// Update Enemies
				for (let i = g.enemies.length - 1; i >= 0; i--) {
					const e = g.enemies[i];
					e.wiggle += dt * 5;
					e.y += e.speed * dt;
					e.x += Math.sin(e.wiggle) * 0.4;

					// Check collision with player
					if (
						e.x < g.player.x + g.player.width &&
						e.x + e.width > g.player.x &&
						e.y < g.player.y + g.player.height &&
						e.y + e.height > g.player.y
					) {
						// Player hit!
						audioEngine.playExplosion();
						// Spawn particles
						for (let p = 0; p < 12; p++) {
							g.particles.push({
								x: e.x + e.width / 2,
								y: e.y + e.height / 2,
								vx: (Math.random() - 0.5) * 90,
								vy: (Math.random() - 0.5) * 90,
								life: 0.4,
								maxLife: 0.4,
								color: "#ef4444",
							});
						}
						g.enemies.splice(i, 1);
						g.lives -= 1;
						g.combo = 0;
						setLives(g.lives);
						if (g.lives <= 0) {
							// Game Over
							audioEngine.playGameOver();
							g.state = "gameover";
							setGameState("gameover");
							setHighScore((prev) => {
								const best = Math.max(prev, g.score);
								try {
									localStorage.setItem("bug_buster_high", String(best));
								} catch (err) {}
								return best;
							});
						}
						continue;
					}

					// Escaped past bottom
					if (e.y > CANVAS_HEIGHT) {
						g.enemies.splice(i, 1);
						g.combo = 0;
						continue;
					}

					// Bullet vs Enemy collision
					for (let j = g.bullets.length - 1; j >= 0; j--) {
						const b = g.bullets[j];
						if (
							b.x < e.x + e.width &&
							b.x + b.width > e.x &&
							b.y < e.y + e.height &&
							b.y + b.height > e.y
						) {
							// Hit!
							g.bullets.splice(j, 1);
							e.hp -= 1;
							if (e.hp <= 0) {
								audioEngine.playSquash();
								g.combo += 1;
								const pts = e.score * Math.min(g.combo, 4);
								g.score += pts;
								setScore(g.score);

								// Floating score text
								g.floatingTexts.push({
									text: g.combo > 1 ? `+${pts} x${g.combo}` : `+${pts}`,
									x: e.x,
									y: e.y,
									life: 0.6,
									color: g.combo > 2 ? "#facc15" : "#38bdf8",
								});

								// Splatter particles
								for (let p = 0; p < 8; p++) {
									g.particles.push({
										x: e.x + e.width / 2,
										y: e.y + e.height / 2,
										vx: (Math.random() - 0.5) * 80,
										vy: (Math.random() - 0.5) * 80,
										life: 0.35,
										maxLife: 0.35,
										color: e.color,
									});
								}
								g.enemies.splice(i, 1);
							} else {
								// Armor hit spark
								audioEngine.playBump();
								e.color = "#fbcfe8";
							}
							break;
						}
					}
				}

				// Update Pickups
				for (let i = g.pickups.length - 1; i >= 0; i--) {
					const p = g.pickups[i];
					p.y += p.speed * dt;
					if (
						p.x < g.player.x + g.player.width &&
						p.x + p.width > g.player.x &&
						p.y < g.player.y + g.player.height &&
						p.y + p.height > g.player.y
					) {
						audioEngine.playCoin();
						g.score += 250;
						setScore(g.score);
						g.floatingTexts.push({
							text: "+250 COFFEE BOOST!",
							x: p.x - 20,
							y: p.y,
							life: 0.7,
							color: "#fbbf24",
						});
						g.pickups.splice(i, 1);
						continue;
					}
					if (p.y > CANVAS_HEIGHT) {
						g.pickups.splice(i, 1);
					}
				}

				// Update Particles
				for (let i = g.particles.length - 1; i >= 0; i--) {
					const pt = g.particles[i];
					pt.x += pt.vx * dt;
					pt.y += pt.vy * dt;
					pt.life -= dt;
					if (pt.life <= 0) {
						g.particles.splice(i, 1);
					}
				}

				// Update Floating Texts
				for (let i = g.floatingTexts.length - 1; i >= 0; i--) {
					const ft = g.floatingTexts[i];
					ft.y -= 25 * dt;
					ft.life -= dt;
					if (ft.life <= 0) {
						g.floatingTexts.splice(i, 1);
					}
				}
			}

			// RENDER
			// Background
			ctx.fillStyle = "#020c1b";
			ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			// Starfield grid
			ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
			for (let x = 0; x < CANVAS_WIDTH; x += 16) {
				ctx.fillRect(x, 0, 1, CANVAS_HEIGHT);
			}
			for (let y = 0; y < CANVAS_HEIGHT; y += 16) {
				ctx.fillRect(0, y, 1, CANVAS_WIDTH);
			}

			// Bullets
			ctx.fillStyle = "#38bdf8";
			g.bullets.forEach((b) => {
				ctx.fillRect(Math.round(b.x), Math.round(b.y), b.width, b.height);
			});

			// Enemies
			g.enemies.forEach((e) => {
				ctx.fillStyle = e.color;
				const ex = Math.round(e.x);
				const ey = Math.round(e.y);
				// Pixel bug silhouette
				ctx.fillRect(ex + 2, ey, e.width - 4, e.height);
				ctx.fillRect(ex, ey + 2, e.width, e.height - 4);
				// Bug eyes
				ctx.fillStyle = "#ffffff";
				ctx.fillRect(ex + 3, ey + 2, 2, 2);
				ctx.fillRect(ex + e.width - 5, ey + 2, 2, 2);
				ctx.fillStyle = "#000000";
				ctx.fillRect(ex + 4, ey + 3, 1, 1);
				ctx.fillRect(ex + e.width - 4, ey + 3, 1, 1);
			});

			// Pickups (Coffee Mug / Gem)
			g.pickups.forEach((p) => {
				const px = Math.round(p.x);
				const py = Math.round(p.y);
				ctx.fillStyle = "#fbbf24";
				ctx.fillRect(px + 1, py, 6, 8);
				ctx.fillRect(px + 6, py + 2, 2, 4);
				ctx.fillStyle = "#ffffff";
				ctx.fillRect(px + 2, py + 2, 4, 3);
			});

			// Particles
			g.particles.forEach((pt) => {
				ctx.fillStyle = pt.color;
				const alpha = Math.max(0, pt.life / pt.maxLife);
				ctx.globalAlpha = alpha;
				ctx.fillRect(Math.round(pt.x), Math.round(pt.y), 2, 2);
				ctx.globalAlpha = 1.0;
			});

			// Player Ship / Debugger
			const px = Math.round(g.player.x);
			const py = Math.round(g.player.y);
			// Hull
			ctx.fillStyle = "#facc15";
			ctx.fillRect(px + 5, py, 4, 10);
			ctx.fillRect(px + 2, py + 4, 10, 6);
			ctx.fillRect(px, py + 7, 14, 3);
			// Cockpit
			ctx.fillStyle = "#38bdf8";
			ctx.fillRect(px + 6, py + 2, 2, 3);
			// Engine thruster glow
			if (g.state === "playing" && Math.random() > 0.3) {
				ctx.fillStyle = "#ef4444";
				ctx.fillRect(px + 5, py + 10, 4, 3);
			}

			// Floating Texts
			g.floatingTexts.forEach((ft) => {
				ctx.fillStyle = ft.color;
				ctx.font = "8px 'Press Start 2P', monospace, sans-serif";
				ctx.fillText(ft.text, Math.round(ft.x), Math.round(ft.y));
			});

			// HUD Header in playing state
			if (g.state === "playing") {
				ctx.fillStyle = "#facc15";
				ctx.font = "8px monospace";
				ctx.fillText(`SCORE: ${g.score}`, 8, 12);

				// Lives
				ctx.fillStyle = "#ef4444";
				for (let l = 0; l < g.lives; l++) {
					ctx.fillText("♥", CANVAS_WIDTH - 36 + l * 10, 12);
				}
			}

			animId = requestAnimationFrame(loop);
		};

		animId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(animId);
	}, []);

	// Touch control helpers
	const handleHold = (key, pressed) => (e) => {
		e.preventDefault();
		gameRef.current.keys[key] = pressed;
	};

	const triggerFire = (e) => {
		e.preventDefault();
		if (gameState !== "playing") {
			startGame();
		} else {
			gameRef.current.keys.fire = true;
			setTimeout(() => {
				gameRef.current.keys.fire = false;
			}, 100);
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-sm select-none"
			role="dialog"
			aria-modal="true"
			aria-label="Cyber Bug Buster Arcade Game"
		>
			<div className="relative flex flex-col items-center bg-[#071426] border-4 border-yellow-400 rounded-lg p-3 sm:p-5 shadow-2xl max-w-lg w-full">
				{/* Arcade Cabinet Marquee Header */}
				<div className="flex w-full items-center justify-between pb-2 mb-2 border-b-2 border-yellow-500/40">
					<div className="flex items-center gap-2">
						<span className="text-xl animate-pulse">👾</span>
						<div>
							<h2 className="pixelify-sans text-yellow-400 text-lg sm:text-xl font-bold tracking-wider leading-none">
								BUG BUSTER : 1984
							</h2>
							<p className="text-[10px] text-yellow-200/80 font-mono">
								HI-SCORE: {highScore} | LIVES: {lives > 0 ? "♥".repeat(lives) : "💀"}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={toggleSound}
							aria-label={isMuted ? "Unmute audio" : "Mute audio"}
							className="px-2 py-1 text-xs font-mono bg-yellow-500/20 text-yellow-300 border border-yellow-500 hover:bg-yellow-500 hover:text-black transition-colors"
						>
							{isMuted ? "🔇 MUTED" : "🔊 SFX ON"}
						</button>
						<button
							type="button"
							onClick={onClose}
							aria-label="Exit Arcade"
							className="px-2.5 py-1 text-xs font-mono bg-red-600 text-white font-bold hover:bg-red-500 active:scale-95 transition-all"
						>
							✕ EXIT
						</button>
					</div>
				</div>

				{/* CRT Monitor Frame */}
				<div className="relative border-4 border-cyan-500/60 rounded bg-black overflow-hidden shadow-[inset_0_0_20px_rgba(56,189,248,0.25)]">
					{/* Canvas */}
					<canvas
						ref={canvasRef}
						width={CANVAS_WIDTH}
						height={CANVAS_HEIGHT}
						className="block w-[280px] sm:w-[380px] h-[210px] sm:h-[285px]"
						style={{ imageRendering: "pixelated" }}
					/>

					{/* Retro CRT Scanline Overlay */}
					<div
						className="absolute inset-0 pointer-events-none opacity-20"
						style={{
							backgroundImage:
								"repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 2px)",
						}}
					/>

					{/* CRT Screen Glow Vignette */}
					<div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]" />

					{/* Start Screen Overlay */}
					{gameState === "start" && (
						<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 text-center p-4">
							<h3 className="text-yellow-400 font-bold text-lg sm:text-2xl animate-pulse tracking-wide font-mono mb-2">
								SQUASH THE GLITCHES!
							</h3>
							<p className="text-cyan-300 text-xs sm:text-sm font-mono mb-1">
								🐞 Bugs (+100) | 🐛 Leaks (+150) | ☕ Coffee (+250)
							</p>
							<p className="text-gray-300 text-[11px] font-mono mb-4">
								Arrows/WASD to Move • SPACE to Fire
							</p>
							<button
								type="button"
								onClick={startGame}
								className="px-5 py-2 bg-yellow-400 text-slate-950 font-bold text-sm sm:text-base border-2 border-yellow-200 hover:bg-yellow-300 active:scale-95 font-mono shadow-[0_0_15px_rgba(250,204,21,0.5)]"
							>
								► INSERT COIN / PLAY
							</button>
						</div>
					)}

					{/* Game Over Overlay */}
					{gameState === "gameover" && (
						<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-center p-4">
							<h3 className="text-red-500 font-bold text-xl sm:text-3xl animate-bounce font-mono mb-1">
								SYSTEM CRASH!
							</h3>
							<p className="text-yellow-400 text-sm sm:text-base font-mono mb-1">
								FINAL SCORE: {score}
							</p>
							{score >= highScore && score > 0 && (
								<p className="text-emerald-400 text-xs font-mono mb-3 animate-pulse">
									★ NEW HIGH SCORE! ★
								</p>
							)}
							<div className="flex gap-3 mt-2">
								<button
									type="button"
									onClick={startGame}
									className="px-4 py-2 bg-yellow-400 text-slate-950 font-bold text-xs sm:text-sm border-2 border-yellow-200 hover:bg-yellow-300 active:scale-95 font-mono"
								>
									↺ RETRY
								</button>
								<button
									type="button"
									onClick={onClose}
									className="px-4 py-2 bg-slate-700 text-white font-bold text-xs sm:text-sm border-2 border-slate-500 hover:bg-slate-600 active:scale-95 font-mono"
								>
									BACK TO HUB
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Mobile Arcade Controller Controls */}
				<div className="flex w-full justify-between items-center mt-3 pt-2 sm:hidden border-t border-yellow-500/20">
					{/* Directional Pad */}
					<div className="flex gap-2">
						<button
							type="button"
							onPointerDown={handleHold("left", true)}
							onPointerUp={handleHold("left", false)}
							onPointerLeave={handleHold("left", false)}
							className="h-12 w-14 bg-yellow-500 text-black font-bold text-xl active:bg-yellow-300 active:scale-95 border-2 border-yellow-200 select-none shadow-md"
						>
							◀
						</button>
						<button
							type="button"
							onPointerDown={handleHold("right", true)}
							onPointerUp={handleHold("right", false)}
							onPointerLeave={handleHold("right", false)}
							className="h-12 w-14 bg-yellow-500 text-black font-bold text-xl active:bg-yellow-300 active:scale-95 border-2 border-yellow-200 select-none shadow-md"
						>
							▶
						</button>
					</div>

					{/* Action / Fire Button */}
					<button
						type="button"
						onPointerDown={triggerFire}
						className="h-14 w-20 bg-red-500 text-white font-bold text-sm border-2 border-red-300 rounded active:bg-red-400 active:scale-95 shadow-[0_0_10px_rgba(239,68,68,0.5)] select-none font-mono"
					>
						FIRE!
					</button>
				</div>
			</div>
		</div>
	);
}
