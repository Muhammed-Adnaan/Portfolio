import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import homeBG from "./assets/images/homePage.png";
import { prefersReducedMotion } from "../lib/retro";
import { audioEngine } from "../lib/audioEngine";
import ArcadeMiniGame from "./ArcadeMiniGame";
import NpcDialogue from "./NpcDialogue";
import AchievementBanner from "./AchievementBanner";

/**
 * HubWorld - Interactive Retro 8-Bit Mini-Game & Secret Room
 *
 * Authored in 320x192 logical pixel grid, scaled with crisp nearest-neighbor rendering.
 * Features:
 * - Real-time procedural 8-bit sound effects (Web Audio API)
 * - 5 Hidden Easter Egg Collectibles & Relics with floating animations
 * - Interactive Arcade Machine with playable "Bug Buster 1984" mini-game
 * - Interactive NPC Mascot "Byte the Bot" with humorous developer dialogue & tips
 * - Sprint & Dash mechanics with particle dust trails and rainbow aura
 * - Wall bump feedback & throttled footstep audio
 * - Full Mobile D-Pad and [A] / [B] arcade buttons
 * - Unbroken directory navigation doors for accessibility
 */
const WORLD = { width: 320, height: 192 };
const WALL = 12;
const MAX_SCALE = 3;
const PLAYER = { width: 10, height: 14, walkSpeed: 82, sprintSpeed: 145 };

const DOOR = { width: 66, height: 24 };
const DOORS = [
	{ to: "/about", label: "ABOUT", x: 20, y: 12 },
	{ to: "/projects", label: "PROJECTS", x: 127, y: 12 },
	{ to: "/skills", label: "SKILLS", x: 234, y: 12 },
	{ to: "/resume", label: "RESUME", x: 58, y: 156 },
	{ to: "/contact", label: "CONTACT", x: 196, y: 156 },
];

const ARCADE = { x: 276, y: 74, width: 24, height: 34, label: "BUG BUSTER" };
const NPC = { x: 62, y: 76, width: 18, height: 22, name: "BYTE" };

const RELICS = [
	{
		id: "relic_ruby",
		name: "Ruby of Passion",
		icon: "💎",
		color: "#f43f5e",
		x: 26,
		y: 64,
	},
	{
		id: "relic_gold",
		name: "Git Commit Star",
		icon: "🪙",
		color: "#facc15",
		x: 155,
		y: 52,
	},
	{
		id: "relic_emerald",
		name: "Emerald Clean Code",
		icon: "🔮",
		color: "#10b981",
		x: 284,
		y: 130,
	},
	{
		id: "relic_sapphire",
		name: "Sapphire Byte",
		icon: "🔷",
		color: "#38bdf8",
		x: 26,
		y: 138,
	},
	{
		id: "relic_star",
		name: "Full-Stack Core",
		icon: "⭐",
		color: "#e879f9",
		x: 155,
		y: 134,
	},
];

const MOVE_KEYS = {
	ArrowUp: "up",
	KeyW: "up",
	ArrowDown: "down",
	KeyS: "down",
	ArrowLeft: "left",
	KeyA: "left",
	ArrowRight: "right",
	KeyD: "right",
};
const SPRINT_KEYS = new Set(["ShiftLeft", "ShiftRight", "KeyK", "KeyJ"]);
const ACTION_KEYS = new Set(["Enter", "Space", "KeyE"]);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const overlapsDoor = (player, door) =>
	player.x < door.x + DOOR.width &&
	player.x + PLAYER.width > door.x &&
	player.y < door.y + DOOR.height &&
	player.y + PLAYER.height > door.y;

const distance = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

const isInteractive = (node) =>
	node instanceof HTMLElement &&
	(node.tagName === "A" ||
		node.tagName === "BUTTON" ||
		node.tagName === "INPUT" ||
		node.isContentEditable);

export default function HubWorld({ onExit }) {
	const navigate = useNavigate();
	const stageRef = useRef(null);
	const spriteRef = useRef(null);
	const particleCanvasRef = useRef(null);

	// Player position & movement
	const position = useRef({ x: 155, y: 88 });
	const input = useRef({
		up: false,
		down: false,
		left: false,
		right: false,
		sprint: false,
	});

	// Interaction tracking
	const activeDoor = useRef(-1);
	const [doorIndex, setDoorIndex] = useState(-1);
	const [nearArcade, setNearArcade] = useState(false);
	const [nearNpc, setNearNpc] = useState(false);
	const [isSprinting, setIsSprinting] = useState(false);

	// Modals and screens
	const [arcadeOpen, setArcadeOpen] = useState(false);
	const [npcOpen, setNpcOpen] = useState(false);
	const [achievementOpen, setAchievementOpen] = useState(false);

	// Collectibles & Audio state
	const [collectedRelics, setCollectedRelics] = useState(() => new Set());
	const [recentNotification, setRecentNotification] = useState(null);
	const [isMuted, setIsMuted] = useState(audioEngine.getMuted());
	const [scale, setScale] = useState(1);

	// Particle collection for dust & sprint trails
	const particles = useRef([]);
	const lastFootstep = useRef(0);
	const lastParticleTime = useRef(0);

	// Measure & scale room viewport
	useLayoutEffect(() => {
		const stage = stageRef.current;
		if (!stage) return undefined;
		const measure = () =>
			setScale(Math.min(stage.clientWidth / WORLD.width, MAX_SCALE));
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(stage);
		return () => observer.disconnect();
	}, []);

	// Mute toggle helper
	const toggleMute = useCallback(() => {
		const muted = audioEngine.toggleMute();
		setIsMuted(muted);
	}, []);

	// Enter door helper
	const enterDoor = useCallback(
		(index) => {
			const targetIndex = index !== undefined ? index : activeDoor.current;
			if (targetIndex < 0 || targetIndex >= DOORS.length) return;
			const target = DOORS[targetIndex];
			if (target.to === "/contact") {
				try {
					sessionStorage.setItem("avatar_contact_active", "true");
				} catch (e) {}
			}
			audioEngine.playDoor();
			navigate(target.to);
			onExit();
		},
		[navigate, onExit]
	);

	// Main physics, collision, and particle animation loop
	useEffect(() => {
		let frame;
		let previous = performance.now();

		const tick = (now) => {
			const delta = Math.min((now - previous) / 1000, 0.05);
			previous = now;

			// Skip physics updates when a modal/arcade game is active
			if (arcadeOpen || npcOpen || achievementOpen) {
				frame = requestAnimationFrame(tick);
				return;
			}

			const held = input.current;
			const dx = (held.right ? 1 : 0) - (held.left ? 1 : 0);
			const dy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
			const player = position.current;
			const sprinting = held.sprint;

			if (isSprinting !== sprinting) {
				setIsSprinting(sprinting);
				if (sprinting && (dx || dy)) {
					audioEngine.playDash();
				}
			}

			if (dx || dy) {
				const length = Math.hypot(dx, dy);
				const speed = sprinting ? PLAYER.sprintSpeed : PLAYER.walkSpeed;
				const step = speed * delta;
				const nextX = player.x + (dx / length) * step;
				const nextY = player.y + (dy / length) * step;

				// Boundary check with wall bump sound feedback
				const clampedX = clamp(
					nextX,
					WALL,
					WORLD.width - WALL - PLAYER.width
				);
				const clampedY = clamp(
					nextY,
					WALL,
					WORLD.height - WALL - PLAYER.height
				);

				if (clampedX !== nextX || clampedY !== nextY) {
					audioEngine.playBump();
				}

				player.x = clampedX;
				player.y = clampedY;

				// Throttled footsteps
				const stepInterval = sprinting ? 140 : 230;
				if (now - lastFootstep.current > stepInterval) {
					lastFootstep.current = now;
					audioEngine.playStep();
				}

				// Spawn dust / sprint trail particles
				const particleInterval = sprinting ? 35 : 100;
				if (now - lastParticleTime.current > particleInterval) {
					lastParticleTime.current = now;
					const allFound = collectedRelics.size >= RELICS.length;
					const rainbowColors = [
						"#f43f5e",
						"#fbbf24",
						"#34d399",
						"#38bdf8",
						"#e879f9",
					];
					const color = allFound
						? rainbowColors[
								Math.floor(Math.random() * rainbowColors.length)
						  ]
						: sprinting
						? "#fde047"
						: "#94a3b8";

					particles.current.push({
						x: player.x + PLAYER.width / 2 + (Math.random() - 0.5) * 4,
						y: player.y + PLAYER.height - 1,
						vx: -dx * (sprinting ? 22 : 10) + (Math.random() - 0.5) * 6,
						vy: -dy * (sprinting ? 22 : 10) - Math.random() * 8,
						size: sprinting ? 2 : 1.5,
						color,
						life: sprinting ? 0.35 : 0.25,
						maxLife: sprinting ? 0.35 : 0.25,
					});
				}
			}

			// Update player sprite position in DOM
			if (spriteRef.current) {
				spriteRef.current.style.transform = `translate(${Math.round(
					player.x
				)}px, ${Math.round(player.y)}px)`;
			}

			// Door collision
			const foundDoor = DOORS.findIndex((door) => overlapsDoor(player, door));
			if (foundDoor !== activeDoor.current) {
				activeDoor.current = foundDoor;
				setDoorIndex(foundDoor);
			}

			// Arcade proximity
			const distArcade = distance(
				player.x + PLAYER.width / 2,
				player.y + PLAYER.height / 2,
				ARCADE.x + ARCADE.width / 2,
				ARCADE.y + ARCADE.height / 2
			);
			const isCloseArcade = distArcade < 28;
			setNearArcade((prev) => {
				if (!prev && isCloseArcade) audioEngine.playInteract();
				return isCloseArcade;
			});

			// NPC proximity
			const distNpc = distance(
				player.x + PLAYER.width / 2,
				player.y + PLAYER.height / 2,
				NPC.x + NPC.width / 2,
				NPC.y + NPC.height / 2
			);
			const isCloseNpc = distNpc < 26;
			setNearNpc((prev) => {
				if (!prev && isCloseNpc) audioEngine.playInteract();
				return isCloseNpc;
			});

			// Relic collection check
			RELICS.forEach((relic) => {
				if (!collectedRelics.has(relic.id)) {
					const distRelic = distance(
						player.x + PLAYER.width / 2,
						player.y + PLAYER.height / 2,
						relic.x + 5,
						relic.y + 5
					);
					if (distRelic < 12) {
						// Collect relic!
						audioEngine.playCoin();
						setCollectedRelics((prev) => {
							const next = new Set(prev);
							next.add(relic.id);
							// Burst particles
							for (let i = 0; i < 16; i++) {
								const angle = Math.random() * Math.PI * 2;
								const spd = 20 + Math.random() * 40;
								particles.current.push({
									x: relic.x + 5,
									y: relic.y + 5,
									vx: Math.cos(angle) * spd,
									vy: Math.sin(angle) * spd,
									size: 2,
									color: relic.color,
									life: 0.6,
									maxLife: 0.6,
								});
							}
							// Notification toast
							setRecentNotification(`+ FOUND: ${relic.name}!`);
							setTimeout(() => setRecentNotification(null), 2500);

							// Check if all relics collected!
							if (next.size === RELICS.length) {
								setTimeout(() => {
									audioEngine.playVictory();
									setAchievementOpen(true);
								}, 400);
							}
							return next;
						});
					}
				}
			});

			// Render particle canvas
			const pCanvas = particleCanvasRef.current;
			if (pCanvas) {
				const ctx = pCanvas.getContext("2d");
				ctx.clearRect(0, 0, WORLD.width, WORLD.height);

				for (let i = particles.current.length - 1; i >= 0; i--) {
					const pt = particles.current[i];
					pt.x += pt.vx * delta;
					pt.y += pt.vy * delta;
					pt.life -= delta;
					if (pt.life <= 0) {
						particles.current.splice(i, 1);
						continue;
					}
					const alpha = Math.max(0, pt.life / pt.maxLife);
					ctx.fillStyle = pt.color;
					ctx.globalAlpha = alpha;
					ctx.fillRect(
						Math.round(pt.x),
						Math.round(pt.y),
						pt.size,
						pt.size
					);
					ctx.globalAlpha = 1.0;
				}
			}

			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [
		arcadeOpen,
		npcOpen,
		achievementOpen,
		collectedRelics,
		isSprinting,
		navigate,
		onExit,
	]);

	// Keyboard event listener
	useEffect(() => {
		const press = (event) => {
			if (arcadeOpen || npcOpen || achievementOpen) return;

			if (SPRINT_KEYS.has(event.code)) {
				input.current.sprint = true;
				return;
			}

			const direction = MOVE_KEYS[event.code];
			if (direction) {
				input.current[direction] = true;
				event.preventDefault();
				return;
			}

			if (ACTION_KEYS.has(event.code) && !isInteractive(event.target)) {
				event.preventDefault();
				// Action priority:
				// 1. Arcade Cabinet
				if (nearArcade) {
					audioEngine.playInteract();
					setArcadeOpen(true);
					return;
				}
				// 2. Mascot NPC
				if (nearNpc) {
					audioEngine.playInteract();
					setNpcOpen(true);
					return;
				}
				// 3. Navigation Door
				if (activeDoor.current >= 0) {
					enterDoor(activeDoor.current);
				}
			}
		};

		const release = (event) => {
			if (SPRINT_KEYS.has(event.code)) {
				input.current.sprint = false;
				return;
			}
			const direction = MOVE_KEYS[event.code];
			if (direction) input.current[direction] = false;
		};

		const clearInput = () => {
			input.current = {
				up: false,
				down: false,
				left: false,
				right: false,
				sprint: false,
			};
		};

		window.addEventListener("keydown", press);
		window.addEventListener("keyup", release);
		window.addEventListener("blur", clearInput);
		return () => {
			window.removeEventListener("keydown", press);
			window.removeEventListener("keyup", release);
			window.removeEventListener("blur", clearInput);
		};
	}, [
		arcadeOpen,
		npcOpen,
		achievementOpen,
		nearArcade,
		nearNpc,
		enterDoor,
	]);

	// Mobile touch hold handlers
	const hold = useCallback(
		(direction, pressed) => (event) => {
			event.preventDefault();
			input.current[direction] = pressed;
		},
		[]
	);

	const holdSprint = useCallback(
		(pressed) => (event) => {
			event.preventDefault();
			input.current.sprint = pressed;
		},
		[]
	);

	const triggerAction = useCallback(
		(event) => {
			if (event) event.preventDefault();
			if (nearArcade) {
				audioEngine.playInteract();
				setArcadeOpen(true);
			} else if (nearNpc) {
				audioEngine.playInteract();
				setNpcOpen(true);
			} else if (activeDoor.current >= 0) {
				enterDoor(activeDoor.current);
			}
		},
		[nearArcade, nearNpc, enterDoor]
	);

	const currentDoor = doorIndex >= 0 ? DOORS[doorIndex] : null;
	const still = prefersReducedMotion();
	const allRelicsFound = collectedRelics.size >= RELICS.length;

	return (
		<div
			className="pixelify-sans relative min-h-full w-full flex flex-col items-center px-4 pt-4 pb-10"
			style={{
				backgroundColor: "#00234b",
				backgroundImage: `url(${homeBG})`,
				backgroundRepeat: "no-repeat",
				backgroundSize: "cover",
			}}
		>
			<div
				className="absolute inset-0 bg-[#00234b]/80"
				aria-hidden="true"
			/>

			{/* Top Header & HUD Bar */}
			<header className="relative mb-2 text-center w-full max-w-xl flex flex-col items-center">
				<div className="flex w-full items-center justify-between px-2 mb-1">
					{/* Collectibles HUD Counter */}
					<div
						className="flex items-center gap-1.5 px-2.5 py-1 bg-[#001733] border-2 border-yellow-400 rounded-sm font-mono text-xs sm:text-sm text-yellow-300 shadow"
						title="Collect all 5 hidden Easter Egg Relics in the room!"
					>
						<span>🏆 RELICS:</span>
						<span className="font-bold text-yellow-400">
							{collectedRelics.size}/{RELICS.length}
						</span>
						{allRelicsFound && <span className="text-emerald-400">★ MAX</span>}
					</div>

					{/* Audio Mute/Unmute Toggle */}
					<button
						type="button"
						onClick={toggleMute}
						className="flex items-center gap-1 px-2.5 py-1 bg-[#001733] border-2 border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-[#00234b] font-mono text-xs transition-colors rounded-sm"
						aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
					>
						<span>{isMuted ? "🔇" : "🔊"}</span>
						<span className="hidden sm:inline font-bold">
							{isMuted ? "MUTED" : "SFX ON"}
						</span>
					</button>
				</div>

				<h1 className="text-yellow-400 text-lg sm:text-2xl font-bold tracking-wider">
					★ SECRET HUB WORLD ★
				</h1>
				<p className="text-cyan-200 text-xs sm:text-sm">
					Walk to doors, talk to Byte, play the Arcade, or gather relics!
				</p>
			</header>

			{/* Floating Notification Toast */}
			{recentNotification && (
				<div className="fixed top-16 z-40 px-4 py-1.5 bg-yellow-400 text-[#00234b] border-2 border-yellow-100 font-mono text-xs sm:text-sm font-bold shadow-xl animate-bounce">
					{recentNotification}
				</div>
			)}

			{/* The Scaled 320x192 Room */}
			<div
				ref={stageRef}
				className="relative w-full"
				style={{ maxWidth: WORLD.width * MAX_SCALE }}
			>
				<div
					className="relative overflow-hidden"
					style={{ height: WORLD.height * scale }}
				>
					<div
						className="absolute top-0 left-0 border-4 border-yellow-500 shadow-2xl"
						style={{
							width: WORLD.width,
							height: WORLD.height,
							transform: `scale(${scale})`,
							transformOrigin: "top left",
							backgroundColor: "#001a38",
							backgroundImage:
								"repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 16px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 16px)",
							imageRendering: "pixelated",
						}}
					>
						{/* Particle & Sprint Trail Canvas */}
						<canvas
							ref={particleCanvasRef}
							width={WORLD.width}
							height={WORLD.height}
							className="absolute inset-0 pointer-events-none z-10"
							style={{ imageRendering: "pixelated" }}
						/>

						{/* Navigation Doors */}
						{DOORS.map((door, index) => {
							const active = index === doorIndex;
							return (
								<Link
									key={door.to}
									to={door.to}
									onClick={() => enterDoor(index)}
									className="absolute flex items-center justify-center border-2 no-underline z-20 transition-colors"
									style={{
										left: door.x,
										top: door.y,
										width: DOOR.width,
										height: DOOR.height,
										borderColor: active ? "#fde047" : "#eab308",
										backgroundColor: active ? "#eab308" : "#012a5c",
										color: active ? "#00234b" : "#eab308",
										fontSize: 8,
										letterSpacing: 0,
										whiteSpace: "nowrap",
										boxShadow: active
											? "0 0 8px rgba(253, 224, 71, 0.7)"
											: "none",
									}}
								>
									{door.label}
								</Link>
							);
						})}

						{/* Hidden Collectible Relics */}
						{RELICS.map((relic) => {
							const isCollected = collectedRelics.has(relic.id);
							if (isCollected) return null;
							return (
								<div
									key={relic.id}
									className={`absolute z-15 flex items-center justify-center ${
										still ? "" : "animate-bounce"
									}`}
									style={{
										left: relic.x,
										top: relic.y,
										width: 10,
										height: 10,
									}}
									title={relic.name}
								>
									<div
										style={{
											width: 8,
											height: 8,
											backgroundColor: relic.color,
											boxShadow: `0 0 6px ${relic.color}`,
											transform: "rotate(45deg)",
										}}
									/>
								</div>
							);
						})}

						{/* Arcade Cabinet */}
						<div
							className="absolute z-20 cursor-pointer"
							onClick={() => {
								audioEngine.playInteract();
								setArcadeOpen(true);
							}}
							style={{
								left: ARCADE.x,
								top: ARCADE.y,
								width: ARCADE.width,
								height: ARCADE.height,
							}}
							title="Play Bug Buster Arcade Game!"
						>
							{/* Cabinet body */}
							<div className="relative w-full h-full bg-[#0a192f] border-2 border-yellow-400 flex flex-col items-center">
								{/* Marquee */}
								<div className="w-full bg-red-600 text-yellow-300 text-[6px] font-mono text-center py-0.5 font-bold">
									ARCADE
								</div>
								{/* CRT Screen */}
								<div className="w-[18px] h-[14px] bg-[#001020] border border-cyan-400 mt-1 relative overflow-hidden flex items-center justify-center">
									<span className="text-[7px] text-cyan-300 animate-pulse">
										👾
									</span>
								</div>
								{/* Control Panel */}
								<div className="w-full mt-auto bg-[#1e293b] py-0.5 flex justify-center gap-1">
									<div className="w-1.5 h-1.5 rounded-full bg-red-500" />
									<div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
								</div>
							</div>
							{/* Proximity Glow / Indicator */}
							{nearArcade && (
								<div className="absolute -top-4 left-1/2 -translate-x-1/2 px-1 bg-yellow-400 text-black text-[6px] font-mono font-bold whitespace-nowrap animate-bounce">
									[E] PLAY
								</div>
							)}
						</div>

						{/* NPC Mascot: Byte the Bot */}
						<div
							className="absolute z-20 cursor-pointer"
							onClick={() => {
								audioEngine.playInteract();
								setNpcOpen(true);
							}}
							style={{
								left: NPC.x,
								top: NPC.y,
								width: NPC.width,
								height: NPC.height,
							}}
							title="Talk to Byte the Dev Mascot!"
						>
							<div
								className={`relative w-full h-full flex flex-col items-center ${
									still ? "" : "animate-sprite-bob"
								}`}
							>
								{/* Antenna */}
								<div className="w-1 h-1.5 bg-yellow-400" />
								<div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
								{/* Head / Visor */}
								<div className="w-3.5 h-3 bg-cyan-400 border border-slate-900 flex items-center justify-center gap-0.5">
									<div className="w-0.5 h-1 bg-black" />
									<div className="w-0.5 h-1 bg-black" />
								</div>
								{/* Body */}
								<div className="w-4 h-3 bg-yellow-400 border border-slate-900 flex items-center justify-center">
									<div className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
								</div>
							</div>
							{/* Proximity / Overhead Indicator */}
							{nearNpc ? (
								<div className="absolute -top-4 left-1/2 -translate-x-1/2 px-1 bg-yellow-400 text-black text-[6px] font-mono font-bold whitespace-nowrap animate-bounce">
									[E] TALK
								</div>
							) : (
								<div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-yellow-300 animate-bounce">
									💬
								</div>
							)}
						</div>

						{/* Player Sprite */}
						<div
							ref={spriteRef}
							className="absolute top-0 left-0 z-30"
							style={{ width: PLAYER.width, height: PLAYER.height }}
						>
							<div
								className={still ? undefined : "animate-sprite-bob"}
								style={{ width: PLAYER.width, height: PLAYER.height }}
							>
								{/* Head */}
								<div
									style={{
										position: "absolute",
										left: 1,
										top: 0,
										width: 8,
										height: 7,
										background: allRelicsFound ? "#38bdf8" : "#fde047",
										boxShadow: isSprinting
											? "0 0 6px rgba(253, 224, 71, 0.8)"
											: "none",
									}}
								/>
								{/* Eyes */}
								<div
									style={{
										position: "absolute",
										left: 3,
										top: 3,
										width: 1,
										height: 2,
										background: "#00234b",
									}}
								/>
								<div
									style={{
										position: "absolute",
										left: 6,
										top: 3,
										width: 1,
										height: 2,
										background: "#00234b",
									}}
								/>
								{/* Torso */}
								<div
									style={{
										position: "absolute",
										left: 0,
										top: 7,
										width: 10,
										height: 5,
										background: allRelicsFound ? "#e879f9" : "#eab308",
									}}
								/>
								{/* Legs */}
								<div
									style={{
										position: "absolute",
										left: 1,
										top: 12,
										width: 3,
										height: 2,
										background: "#00234b",
									}}
								/>
								<div
									style={{
										position: "absolute",
										left: 6,
										top: 12,
										width: 3,
										height: 2,
										background: "#00234b",
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Interactive Action Prompt */}
			<div className="relative min-h-[40px] mt-3 flex items-center justify-center text-center px-2" aria-live="polite">
				{nearArcade ? (
					<button
						type="button"
						onClick={() => {
							audioEngine.playInteract();
							setArcadeOpen(true);
						}}
						className="px-4 py-1.5 bg-red-600 text-yellow-300 border border-yellow-400 font-mono font-bold text-xs sm:text-sm animate-pulse shadow-md"
					>
						[E / SPACE] PLAY BUG BUSTER ARCADE 👾
					</button>
				) : nearNpc ? (
					<button
						type="button"
						onClick={() => {
							audioEngine.playInteract();
							setNpcOpen(true);
						}}
						className="px-4 py-1.5 bg-yellow-400 text-[#00234b] border border-yellow-200 font-mono font-bold text-xs sm:text-sm animate-pulse shadow-md"
					>
						[E / SPACE] TALK TO BYTE 🤖
					</button>
				) : currentDoor ? (
					<button
						type="button"
						onClick={() => enterDoor()}
						className="px-5 py-1.5 bg-yellow-400 text-[#00234b] font-bold text-xs sm:text-sm font-mono shadow-md"
					>
						ENTER {currentDoor.label} ▸
					</button>
				) : (
					<p className="text-yellow-400/90 text-xs sm:text-sm font-mono">
						<span className="hidden sm:inline">
							WASD / Arrows to walk • Hold [SHIFT] to Sprint • [E / Space] Interact
						</span>
						<span className="sm:hidden">
							Use D-Pad to walk • Hold [B] to Sprint • [A] Interact
						</span>
					</p>
				)}
			</div>

			{/* Mobile Touch Controller (D-Pad + [B] Sprint + [A] Action) */}
			<div className="relative mt-3 flex w-full max-w-sm items-center justify-between sm:hidden px-3">
				{/* D-Pad */}
				<div
					className="grid grid-cols-3 gap-1 select-none"
					style={{ touchAction: "none" }}
					aria-label="Directional Touch Pad"
				>
					{[
						[null, "up", null],
						["left", null, "right"],
						[null, "down", null],
					].map((row, y) =>
						row.map((direction, x) =>
							direction ? (
								<button
									key={direction}
									type="button"
									tabIndex={-1}
									onPointerDown={hold(direction, true)}
									onPointerUp={hold(direction, false)}
									onPointerCancel={hold(direction, false)}
									onPointerLeave={hold(direction, false)}
									className="h-11 w-11 bg-yellow-500 active:bg-yellow-300 active:scale-95 text-[#00234b] font-bold text-lg border-2 border-yellow-300 shadow flex items-center justify-center"
								>
									{{ up: "▲", down: "▼", left: "◀", right: "▶" }[direction]}
								</button>
							) : (
								<span key={`${x}-${y}`} className="h-11 w-11" />
							)
						)
					)}
				</div>

				{/* Arcade Action Buttons [B] and [A] */}
				<div className="flex items-center gap-3 select-none" style={{ touchAction: "none" }}>
					{/* Button B: Sprint */}
					<div className="flex flex-col items-center">
						<button
							type="button"
							tabIndex={-1}
							onPointerDown={holdSprint(true)}
							onPointerUp={holdSprint(false)}
							onPointerCancel={holdSprint(false)}
							onPointerLeave={holdSprint(false)}
							className="h-13 w-13 rounded-full bg-orange-500 active:bg-orange-400 active:scale-90 text-white font-mono font-bold text-lg border-2 border-orange-300 shadow-lg flex items-center justify-center p-3"
							title="Hold to Sprint"
						>
							B
						</button>
						<span className="text-[10px] text-orange-300 font-mono mt-0.5">DASH</span>
					</div>

					{/* Button A: Interact / Enter */}
					<div className="flex flex-col items-center">
						<button
							type="button"
							tabIndex={-1}
							onPointerDown={triggerAction}
							className="h-15 w-15 rounded-full bg-yellow-400 active:bg-yellow-300 active:scale-90 text-[#00234b] font-mono font-bold text-xl border-2 border-yellow-200 shadow-lg flex items-center justify-center p-3.5"
							title="Interact / Enter"
						>
							A
						</button>
						<span className="text-[10px] text-yellow-300 font-mono mt-0.5">ACTION</span>
					</div>
				</div>
			</div>

			{/* Plain navigation links for accessibility & crawlability */}
			<nav className="relative mt-6 w-full max-w-lg" aria-label="Sections">
				<ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
					{DOORS.map((door) => (
						<li key={door.to}>
							<Link
								to={door.to}
								onClick={() => enterDoor(DOORS.findIndex((d) => d.to === door.to))}
								className="inline-flex items-center min-h-[44px] text-yellow-500 hover:text-yellow-300 text-lg transition-colors"
							>
								{door.label}
							</Link>
						</li>
					))}
				</ul>
			</nav>

			{/* Arcade Mini-Game Modal */}
			{arcadeOpen && (
				<ArcadeMiniGame onClose={() => setArcadeOpen(false)} />
			)}

			{/* NPC Dialogue Modal */}
			{npcOpen && (
				<NpcDialogue
					allRelicsFound={allRelicsFound}
					onClose={() => setNpcOpen(false)}
				/>
			)}

			{/* Achievement Modal Banner */}
			{achievementOpen && (
				<AchievementBanner onClose={() => setAchievementOpen(false)} />
			)}
		</div>
	);
}
