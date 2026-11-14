import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { audioEngine } from "../lib/audioEngine";

/**
 * Site-Wide Companion: Byte the Bot
 *
 * Core Mechanics:
 * 1. Flight Physics: Smooth Hover Momentum & Inertia (Acceleration, Friction Drag, Screen Bouncing).
 * 2. Agile Banking Tilt: Real-time chassis roll and skew into turns.
 * 3. Smooth Turret Swivel: Precision spherical tracking towards mouse cursor reticle.
 * 4. Interactive Page Destruction:
 *    Shoots alphabet projectiles that knock letters loose from words anywhere on the site,
 *    tumbling down to the floor under gravity with elastic bounces.
 * 5. Hyperspace Border Warp Page Transitions:
 *    If the user forces against the RIGHT border for 5 seconds -> Warps to NEXT page!
 *    If the user forces against the LEFT border for 5 seconds -> Warps to PREVIOUS page!
 *    Featuring charging energy rift barrier, audio buildup, hyperspace streak tunnel & smooth transition.
 * 6. Mobile: Dual-mode controls ("with and without controller" toggle).
 */

const SHIFT_WINDOW = 800;
const ALPHABET_NAME = ["A", "D", "N", "A", "A", "N"];
const FULL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ACCELERATION = 2200; // px/s^2 thruster acceleration for smooth momentum
const MAX_SPEED = 480; // px/s top agile flight speed
const FRICTION = 1; // 60fps frame damping for hover inertia glide
const SWIVEL_LERP = 14; // rad/s turret swivel agility
const BANK_MAX_DEG = 24; // max banking tilt degrees
const GRAVITY = 760; // Gravity pulling knocked-down letters
const WARP_HOLD_DURATION = 5.0; // 5 seconds of forcing against border to warp

const SITE_ROUTES = [
	{ path: "/", label: "Home" },
	{ path: "/about", label: "About" },
	{ path: "/projects", label: "Projects" },
	{ path: "/skills", label: "Skills" },
	{ path: "/blog", label: "Blog" },
	{ path: "/resume", label: "Resume" },
	{ path: "/contact", label: "Contact" },
];

export default function SiteCompanion() {
	const location = useLocation();
	const navigate = useNavigate();

	// Active state: persists in sessionStorage across page navigations
	const [isActive, setIsActive] = useState(() => {
		try {
			return (
				sessionStorage.getItem("avatar_companion_active") === "true" ||
				sessionStorage.getItem("avatar_contact_active") === "true" ||
				(typeof window !== "undefined" && window.location.pathname === "/contact")
			);
		} catch (e) {
			return false;
		}
	});

	const [isAirShooter, setIsAirShooter] = useState(true);
	const [showMobileController, setShowMobileController] = useState(true);
	const [isTouchDevice, setIsTouchDevice] = useState(false);
	const [speech, setSpeech] = useState("");
	const [score, setScore] = useState(0);
	const [knockedCount, setKnockedCount] = useState(0);

	// Warp charging HUD state
	const [warpChargeInfo, setWarpChargeInfo] = useState({
		active: false,
		direction: "",
		targetLabel: "",
		progress: 0,
		timer: 0,
	});

	// Warp transition visual animation overlay
	const [warpTransition, setWarpTransition] = useState({
		active: false,
		direction: "",
		targetLabel: "",
	});

	// Physics refs
	const botPos = useRef({ x: 250, y: 320 });
	const velocity = useRef({ vx: 0, vy: 0 }); // Momentum & inertia
	const aimPos = useRef({ x: 500, y: 320 }); // Cursor aim coordinates
	const botAngle = useRef(0); // Turret swivel angle (radians)
	const bankingTilt = useRef(0); // Agile banking roll / skew angle (degrees)

	// Border warp timers
	const warpRightTimer = useRef(0);
	const warpLeftTimer = useRef(0);
	const lastChargeSound = useRef(0);
	const isWarping = useRef(false);
	const warpStreaks = useRef([]);

	// DOM Refs
	const botElRef = useRef(null);
	const chassisElRef = useRef(null);
	const thrusterElRef = useRef(null);
	const speechElRef = useRef(null);
	const reticleElRef = useRef(null);
	const canvasRef = useRef(null);

	// Movement Keys State (WASD & Arrows)
	const moveKeys = useRef({
		up: false,
		down: false,
		left: false,
		right: false,
	});

	// Projectiles, Falling Letters & Particles
	const bullets = useRef([]);
	const fallingLetters = useRef([]);
	const particles = useRef([]);
	const letterIndex = useRef(0);

	// Shift key detector
	const shiftTaps = useRef(0);
	const lastShift = useRef(0);

	// Helper to find route index
	const getCurrentRouteIndex = useCallback((pathname) => {
		const exactIndex = SITE_ROUTES.findIndex((r) => r.path === pathname);
		if (exactIndex !== -1) return exactIndex;
		if (pathname.startsWith("/projects/")) {
			return SITE_ROUTES.findIndex((r) => r.path === "/projects");
		}
		return 0;
	}, []);

	const getNextRoute = useCallback(
		(pathname) => {
			const currentIdx = getCurrentRouteIndex(pathname);
			const nextIdx = (currentIdx + 1) % SITE_ROUTES.length;
			return SITE_ROUTES[nextIdx];
		},
		[getCurrentRouteIndex]
	);

	const getPrevRoute = useCallback(
		(pathname) => {
			const currentIdx = getCurrentRouteIndex(pathname);
			const prevIdx = (currentIdx - 1 + SITE_ROUTES.length) % SITE_ROUTES.length;
			return SITE_ROUTES[prevIdx];
		},
		[getCurrentRouteIndex]
	);

	// Detect Touch vs Desktop
	useEffect(() => {
		const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
		setIsTouchDevice(touch);
		if (typeof window !== "undefined") {
			botPos.current = {
				x: Math.min(window.innerWidth * 0.7, 450),
				y: Math.min(window.innerHeight * 0.45, 320),
			};
			aimPos.current = {
				x: window.innerWidth * 0.5,
				y: window.innerHeight * 0.35,
			};
		}
	}, []);

	// Auto-activate when visiting /contact or if already stored
	useEffect(() => {
		if (location.pathname === "/contact") {
			setIsActive(true);
			try {
				sessionStorage.setItem("avatar_companion_active", "true");
			} catch (e) {}
		}
	}, [location.pathname]);

	// Welcome greeting when summoned
	useEffect(() => {
		if (isActive) {
			audioEngine.playDoor();
			setSpeech(
				isTouchDevice
					? "BEEP BOOP! Move with D-Pad! Push screen borders for 5s to warp pages!"
					: "WASD to fly • Cursor to aim • Force against borders for 5s to warp pages!"
			);
			const timer = setTimeout(() => setSpeech(""), 6000);
			return () => clearTimeout(timer);
		}
	}, [isActive, isTouchDevice]);

	// Repair all knocked-down letters on current page
	const repairPage = useCallback(() => {
		audioEngine.playVictory();
		const spans = document.querySelectorAll("[data-blastable='true']");
		spans.forEach((span) => {
			span.style.opacity = "1";
			span.style.pointerEvents = "auto";
			span.style.transform = "none";
		});
		fallingLetters.current = [];
		setKnockedCount(0);
		setSpeech("✨ ALL PAGE LETTERS REPAIRED!");
		setTimeout(() => setSpeech(""), 3000);
	}, []);

	// Shoot alphabet projectile from bot blaster along turret swivel angle
	const shootAlphabet = useCallback((targetX = null, targetY = null) => {
		audioEngine.playLaser();

		// Determine letter: cycles through ADNAAN first, then full alphabet
		let char;
		if (letterIndex.current < ALPHABET_NAME.length) {
			char = ALPHABET_NAME[letterIndex.current];
		} else {
			const idx = (letterIndex.current - ALPHABET_NAME.length) % FULL_ALPHABET.length;
			char = FULL_ALPHABET[idx];
		}
		letterIndex.current += 1;

		let firingAngle = botAngle.current;
		if (targetX !== null && targetY !== null) {
			firingAngle = Math.atan2(targetY - botPos.current.y, targetX - botPos.current.x);
		}

		// Fire from front blaster barrel tip (offset from bot center)
		const barrelOffset = 22;
		const originX = botPos.current.x + Math.cos(firingAngle) * barrelOffset;
		const originY = botPos.current.y + Math.sin(firingAngle) * barrelOffset;

		const speed = 780;
		const vx = Math.cos(firingAngle) * speed;
		const vy = Math.sin(firingAngle) * speed;

		const colors = ["#FACC15", "#38BDF8", "#F43F5E", "#A855F7", "#10B981", "#FB923C"];
		const color = colors[Math.floor(Math.random() * colors.length)];

		bullets.current.push({
			x: originX,
			y: originY,
			vx,
			vy,
			char,
			color,
			rotation: firingAngle,
			vRot: (Math.random() - 0.5) * 8,
			life: 4.5,
		});

		// Muzzle flash particles
		for (let m = 0; m < 4; m++) {
			particles.current.push({
				x: originX,
				y: originY,
				vx: Math.cos(firingAngle) * 90 + (Math.random() - 0.5) * 70,
				vy: Math.sin(firingAngle) * 90 + (Math.random() - 0.5) * 70,
				color: "#FACC15",
				char: "✦",
				life: 0.25,
			});
		}
	}, []);

	// Keyboard Controls: WASD & Arrow Keys Movement + Shift 3x + Space to Shoot
	useEffect(() => {
		if (!isActive) return;

		const onKeyDown = (e) => {
			if (e.code === "ArrowUp" || e.code === "KeyW") {
				moveKeys.current.up = true;
				e.preventDefault();
			} else if (e.code === "ArrowDown" || e.code === "KeyS") {
				moveKeys.current.down = true;
				e.preventDefault();
			} else if (e.code === "ArrowLeft" || e.code === "KeyA") {
				moveKeys.current.left = true;
				e.preventDefault();
			} else if (e.code === "ArrowRight" || e.code === "KeyD") {
				moveKeys.current.right = true;
				e.preventDefault();
			}

			// Repair shortcut: Press 'R'
			if (e.code === "KeyR" && !e.repeat) {
				repairPage();
			}

			// Shift 3x Detection to toggle Air Shooter Mode
			if (e.key === "Shift" && !e.repeat) {
				const now = Date.now();
				if (now - lastShift.current > SHIFT_WINDOW) {
					shiftTaps.current = 1;
				} else {
					shiftTaps.current += 1;
				}
				lastShift.current = now;

				if (shiftTaps.current >= 3) {
					shiftTaps.current = 0;
					setIsAirShooter((prev) => {
						const next = !prev;
						if (next) {
							audioEngine.playVictory();
							setSpeech("🚀 AIR SHOOTER ACTIVATED! Aim & Shoot!");
						} else {
							audioEngine.playBump();
							setSpeech("Shooter mode standby.");
						}
						setTimeout(() => setSpeech(""), 4000);
						return next;
					});
				}
			}

			// Spacebar or F to shoot towards cursor
			if (isAirShooter && (e.code === "Space" || e.code === "KeyF")) {
				e.preventDefault();
				shootAlphabet();
			}
		};

		const onKeyUp = (e) => {
			if (e.code === "ArrowUp" || e.code === "KeyW") moveKeys.current.up = false;
			if (e.code === "ArrowDown" || e.code === "KeyS") moveKeys.current.down = false;
			if (e.code === "ArrowLeft" || e.code === "KeyA") moveKeys.current.left = false;
			if (e.code === "ArrowRight" || e.code === "KeyD") moveKeys.current.right = false;
		};

		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
		};
	}, [isActive, isAirShooter, shootAlphabet, repairPage]);

	// Mouse Aiming & Shooting (Cursor points direction)
	useEffect(() => {
		if (!isActive || isTouchDevice) return;

		const onMouseMove = (e) => {
			aimPos.current = { x: e.clientX, y: e.clientY };
		};

		const onClick = (e) => {
			if (!isAirShooter) return;
			// Don't shoot if clicking an interactive button or link
			if (e.target.closest("button, a, input")) return;
			shootAlphabet(e.clientX, e.clientY);
		};

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("click", onClick);
		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("click", onClick);
		};
	}, [isActive, isTouchDevice, isAirShooter, shootAlphabet]);

	// Trigger Hyperdrive Border Warp Transition
	const triggerWarp = useCallback(
		(direction) => {
			if (isWarping.current) return;
			isWarping.current = true;

			warpRightTimer.current = 0;
			warpLeftTimer.current = 0;
			setWarpChargeInfo({ active: false, direction: "", targetLabel: "", progress: 0, timer: 0 });

			const targetRoute =
				direction === "right" ? getNextRoute(location.pathname) : getPrevRoute(location.pathname);

			audioEngine.playWarpBoom();

			// Generate hyperspace star streaks
			warpStreaks.current = Array.from({ length: 65 }, () => ({
				x: Math.random() * window.innerWidth,
				y: Math.random() * window.innerHeight,
				len: 120 + Math.random() * 320,
				speed:
					direction === "right" ? 2200 + Math.random() * 1400 : -2200 - Math.random() * 1400,
				color: Math.random() > 0.4 ? "#38BDF8" : "#FACC15",
				alpha: 0.8 + Math.random() * 0.2,
			}));

			setWarpTransition({
				active: true,
				direction,
				targetLabel: targetRoute.label,
			});

			// Navigate to destination with seamless page entrance
			setTimeout(() => {
				navigate(targetRoute.path);

				// Position bot arriving from opposite border with forward momentum!
				if (direction === "right") {
					botPos.current.x = 45;
					velocity.current.vx = 440;
				} else {
					botPos.current.x = window.innerWidth - 45;
					velocity.current.vx = -440;
				}

				setSpeech(`🚀 WARPED TO ${targetRoute.label.toUpperCase()}!`);
				setTimeout(() => setSpeech(""), 3500);
			}, 300);

			// End warp animation
			setTimeout(() => {
				warpStreaks.current = [];
				setWarpTransition({ active: false, direction: "", targetLabel: "" });
				isWarping.current = false;
			}, 600);
		},
		[getNextRoute, getPrevRoute, location.pathname, navigate]
	);

	// Main 60 FPS Game Loop: Momentum + Turret Swivel + Banking Tilt + 5s Border Warp + Falling Letters Physics
	useEffect(() => {
		if (!isActive) return;

		let frame;
		let lastTime = performance.now();

		const tick = (now) => {
			const dt = Math.min((now - lastTime) / 1000, 0.05);
			lastTime = now;

			// 1. Hover Flight Physics: Acceleration, Momentum & Inertia
			const keys = moveKeys.current;
			let moveX = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
			let moveY = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);

			if (moveX !== 0 && moveY !== 0) {
				moveX *= 0.7071;
				moveY *= 0.7071;
			}

			// Apply thruster acceleration
			if (moveX !== 0 || moveY !== 0) {
				velocity.current.vx += moveX * ACCELERATION * dt;
				velocity.current.vy += moveY * ACCELERATION * dt;
			}

			// Exponential drag / air friction damping for realistic glide inertia
			const drag = Math.pow(FRICTION, dt * 60);
			velocity.current.vx *= drag;
			velocity.current.vy *= drag;

			// Cap maximum flight speed
			const currentSpeed = Math.hypot(velocity.current.vx, velocity.current.vy);
			if (currentSpeed > MAX_SPEED) {
				velocity.current.vx = (velocity.current.vx / currentSpeed) * MAX_SPEED;
				velocity.current.vy = (velocity.current.vy / currentSpeed) * MAX_SPEED;
			}

			// Integrate velocity into position
			botPos.current.x += velocity.current.vx * dt;
			botPos.current.y += velocity.current.vy * dt;

			// Screen boundaries
			const minX = 26;
			const maxX = window.innerWidth - 26;
			const minY = 30;
			const maxY = window.innerHeight - 30;

			// 2. 5-Second Border Force Detection for Page Warping
			const isForcingRight =
				botPos.current.x >= maxX - 4 && (moveKeys.current.right || velocity.current.vx > 50);
			const isForcingLeft =
				botPos.current.x <= minX + 4 && (moveKeys.current.left || velocity.current.vx < -50);

			if (isForcingRight && !isWarping.current) {
				warpRightTimer.current += dt;
				warpLeftTimer.current = Math.max(0, warpLeftTimer.current - dt * 3);

				// Emit border barrier contact sparks
				if (Math.random() < 0.6) {
					particles.current.push({
						x: maxX + 10,
						y: botPos.current.y + (Math.random() - 0.5) * 24,
						vx: -120 - Math.random() * 160,
						vy: (Math.random() - 0.5) * 140,
						color: Math.random() > 0.5 ? "#38BDF8" : "#FACC15",
						char: "⚡",
						life: 0.35,
					});
				}

				// Periodic audio charge pulse
				if (now - lastChargeSound.current > 380) {
					audioEngine.playWarpCharge(warpRightTimer.current / WARP_HOLD_DURATION);
					lastChargeSound.current = now;
				}

				const nextR = getNextRoute(location.pathname);
				setWarpChargeInfo({
					active: true,
					direction: "right",
					targetLabel: nextR.label,
					progress: Math.min(1, warpRightTimer.current / WARP_HOLD_DURATION),
					timer: warpRightTimer.current,
				});

				// Trigger warp once held for 5 seconds
				if (warpRightTimer.current >= WARP_HOLD_DURATION) {
					triggerWarp("right");
				}
			} else if (isForcingLeft && !isWarping.current) {
				warpLeftTimer.current += dt;
				warpRightTimer.current = Math.max(0, warpRightTimer.current - dt * 3);

				// Emit border barrier contact sparks
				if (Math.random() < 0.6) {
					particles.current.push({
						x: minX - 10,
						y: botPos.current.y + (Math.random() - 0.5) * 24,
						vx: 120 + Math.random() * 160,
						vy: (Math.random() - 0.5) * 140,
						color: Math.random() > 0.5 ? "#38BDF8" : "#FACC15",
						char: "⚡",
						life: 0.35,
					});
				}

				// Periodic audio charge pulse
				if (now - lastChargeSound.current > 380) {
					audioEngine.playWarpCharge(warpLeftTimer.current / WARP_HOLD_DURATION);
					lastChargeSound.current = now;
				}

				const prevR = getPrevRoute(location.pathname);
				setWarpChargeInfo({
					active: true,
					direction: "left",
					targetLabel: prevR.label,
					progress: Math.min(1, warpLeftTimer.current / WARP_HOLD_DURATION),
					timer: warpLeftTimer.current,
				});

				// Trigger warp once held for 5 seconds
				if (warpLeftTimer.current >= WARP_HOLD_DURATION) {
					triggerWarp("left");
				}
			} else {
				warpRightTimer.current = Math.max(0, warpRightTimer.current - dt * 2.5);
				warpLeftTimer.current = Math.max(0, warpLeftTimer.current - dt * 2.5);
				if (warpRightTimer.current === 0 && warpLeftTimer.current === 0) {
					setWarpChargeInfo((prev) => (prev.active ? { ...prev, active: false } : prev));
				}
			}

			// Boundary bouncing
			if (botPos.current.x < minX) {
				botPos.current.x = minX;
				velocity.current.vx = -velocity.current.vx * 0.35;
			} else if (botPos.current.x > maxX) {
				botPos.current.x = maxX;
				velocity.current.vx = -velocity.current.vx * 0.35;
			}

			if (botPos.current.y < minY) {
				botPos.current.y = minY;
				velocity.current.vy = -velocity.current.vy * 0.35;
			} else if (botPos.current.y > maxY) {
				botPos.current.y = maxY;
				velocity.current.vy = -velocity.current.vy * 0.35;
			}

			// 3. Smooth Turret Swivel: Precision spherical tracking towards cursor aim
			const aimDx = aimPos.current.x - botPos.current.x;
			const aimDy = aimPos.current.y - botPos.current.y;
			const targetAngle = Math.atan2(aimDy, aimDx);

			let angleDiff = targetAngle - botAngle.current;
			while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
			while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

			botAngle.current += angleDiff * Math.min(1, SWIVEL_LERP * dt);
			const angleDeg = (botAngle.current * 180) / Math.PI;

			// 4. Agile Banking Tilt (Roll & Skew into turns)
			const targetBank = (velocity.current.vx / MAX_SPEED) * BANK_MAX_DEG + angleDiff * 9;
			const clampedTargetBank = Math.max(-BANK_MAX_DEG, Math.min(BANK_MAX_DEG, targetBank));
			bankingTilt.current += (clampedTargetBank - bankingTilt.current) * Math.min(1, 14 * dt);

			// Idle hover wave bobbing
			const isMoving = currentSpeed > 18 || moveX !== 0 || moveY !== 0;
			const idleBob = isMoving ? 0 : Math.sin(now * 0.005) * 3.5;

			// Thruster exhaust trail particles
			if (isMoving && Math.random() < 0.45) {
				const rearX = botPos.current.x - Math.cos(botAngle.current) * 22;
				const rearY = botPos.current.y - Math.sin(botAngle.current) * 22;
				particles.current.push({
					x: rearX,
					y: rearY,
					vx: -Math.cos(botAngle.current) * 80 + (Math.random() - 0.5) * 40,
					vy: -Math.sin(botAngle.current) * 80 + (Math.random() - 0.5) * 40,
					color: Math.random() > 0.4 ? "#38BDF8" : "#FACC15",
					char: "•",
					life: 0.35,
				});
			}

			// Update DOM Bot Position & Aim Rotation
			if (botElRef.current) {
				// Slight thruster vibration when forcing warp
				const warpShake =
					warpRightTimer.current > 1 || warpLeftTimer.current > 1
						? (Math.random() - 0.5) * 4
						: 0;
				botElRef.current.style.transform = `translate(${botPos.current.x + warpShake}px, ${
					botPos.current.y + idleBob + warpShake
				}px) rotate(${angleDeg}deg)`;
			}

			// Update Banking Tilt on Chassis
			if (chassisElRef.current) {
				chassisElRef.current.style.transform = `skewY(${bankingTilt.current * 0.35}deg) rotate(${
					bankingTilt.current * 0.3
				}deg)`;
			}

			// Update Thruster Flame Scale
			if (thrusterElRef.current) {
				const thrustScale = isMoving
					? 1.25 + Math.min(0.65, currentSpeed / MAX_SPEED)
					: 0.85 + Math.sin(now * 0.015) * 0.15;
				thrusterElRef.current.style.transform = `scale(${thrustScale})`;
			}

			// Update Speech Bubble Position (keeps upright above bot)
			if (speechElRef.current) {
				speechElRef.current.style.transform = `translate(${botPos.current.x}px, ${
					botPos.current.y - 38 + idleBob
				}px) translateX(-50%)`;
			}

			// Update Aim Reticle
			if (reticleElRef.current) {
				reticleElRef.current.style.transform = `translate(${aimPos.current.x}px, ${aimPos.current.y}px)`;
			}

			// 5. Canvas Rendering: Laser Aim, Projectiles, Collisions & Warp Streaks
			const canvas = canvasRef.current;
			if (canvas) {
				const ctx = canvas.getContext("2d");
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				const floorY = window.innerHeight - 25;

				// A. Draw Border Warp Energy Barrier when pushing
				if (warpRightTimer.current > 0.1) {
					const progress = Math.min(1, warpRightTimer.current / WARP_HOLD_DURATION);
					const wallW = 12 + progress * 28;
					const x = window.innerWidth - wallW;
					const grad = ctx.createLinearGradient(x, 0, window.innerWidth, 0);
					grad.addColorStop(0, "rgba(56, 189, 248, 0)");
					grad.addColorStop(0.5, `rgba(56, 189, 248, ${0.25 + progress * 0.45})`);
					grad.addColorStop(1, `rgba(250, 204, 21, ${0.4 + progress * 0.5})`);
					ctx.fillStyle = grad;
					ctx.fillRect(x, 0, wallW, window.innerHeight);

					// Electric lightning line
					ctx.save();
					ctx.strokeStyle = progress > 0.7 ? "#FACC15" : "#38BDF8";
					ctx.lineWidth = 2.5;
					ctx.shadowColor = "#38BDF8";
					ctx.shadowBlur = 15;
					ctx.beginPath();
					for (let y = 0; y < window.innerHeight; y += 25) {
						const arcX = x + Math.sin(now * 0.015 + y * 0.08) * (5 + progress * 8);
						if (y === 0) ctx.moveTo(arcX, y);
						else ctx.lineTo(arcX, y);
					}
					ctx.stroke();
					ctx.restore();
				}

				if (warpLeftTimer.current > 0.1) {
					const progress = Math.min(1, warpLeftTimer.current / WARP_HOLD_DURATION);
					const wallW = 12 + progress * 28;
					const grad = ctx.createLinearGradient(0, 0, wallW, 0);
					grad.addColorStop(0, `rgba(250, 204, 21, ${0.4 + progress * 0.5})`);
					grad.addColorStop(0.5, `rgba(56, 189, 248, ${0.25 + progress * 0.45})`);
					grad.addColorStop(1, "rgba(56, 189, 248, 0)");
					ctx.fillStyle = grad;
					ctx.fillRect(0, 0, wallW, window.innerHeight);

					// Electric lightning line
					ctx.save();
					ctx.strokeStyle = progress > 0.7 ? "#FACC15" : "#38BDF8";
					ctx.lineWidth = 2.5;
					ctx.shadowColor = "#38BDF8";
					ctx.shadowBlur = 15;
					ctx.beginPath();
					for (let y = 0; y < window.innerHeight; y += 25) {
						const arcX = wallW - Math.sin(now * 0.015 + y * 0.08) * (5 + progress * 8);
						if (y === 0) ctx.moveTo(arcX, y);
						else ctx.lineTo(arcX, y);
					}
					ctx.stroke();
					ctx.restore();
				}

				// B. Draw Hyperspace Warp Streaks during page jump
				if (warpStreaks.current.length > 0) {
					ctx.save();
					ctx.lineWidth = 3;
					for (let s of warpStreaks.current) {
						ctx.strokeStyle = s.color;
						ctx.globalAlpha = s.alpha;
						ctx.beginPath();
						ctx.moveTo(s.x, s.y);
						ctx.lineTo(s.x + (s.speed > 0 ? s.len : -s.len), s.y);
						ctx.stroke();
						s.x += s.speed * dt;
					}
					ctx.restore();
				}

				// C. Draw Aim Laser Line from Cannon Tip to Reticle
				if (isAirShooter && !isTouchDevice && !isWarping.current) {
					const cannonTipX = botPos.current.x + Math.cos(botAngle.current) * 20;
					const cannonTipY = botPos.current.y + Math.sin(botAngle.current) * 20;
					ctx.save();
					ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
					ctx.lineWidth = 1.2;
					ctx.setLineDash([4, 6]);
					ctx.beginPath();
					ctx.moveTo(cannonTipX, cannonTipY);
					ctx.lineTo(aimPos.current.x, aimPos.current.y);
					ctx.stroke();
					ctx.restore();
				}

				// Query all destructible letter spans on the current page
				const blastableSpans = Array.from(document.querySelectorAll("[data-blastable='true']")).filter(
					(span) => span.style.opacity !== "0"
				);

				const letterTargets = blastableSpans.map((span) => ({
					span,
					char: span.getAttribute("data-char") || "A",
					rect: span.getBoundingClientRect(),
					computedStyle: window.getComputedStyle(span),
				}));

				// D. Update & Draw Bullets
				for (let i = bullets.current.length - 1; i >= 0; i--) {
					const b = bullets.current[i];
					b.x += b.vx * dt;
					b.y += b.vy * dt;
					b.life -= dt;

					// Check collision against actual letters on page!
					let hitLetter = false;
					for (let j = 0; j < letterTargets.length; j++) {
						const target = letterTargets[j];
						const r = target.rect;

						if (b.x >= r.left - 6 && b.x <= r.right + 6 && b.y >= r.top - 6 && b.y <= r.bottom + 6) {
							hitLetter = true;

							// Hide letter from word
							target.span.style.opacity = "0";
							target.span.style.pointerEvents = "none";

							audioEngine.playSquash();
							setScore((s) => s + 100);
							setKnockedCount((c) => c + 1);

							// Launch tumbling falling letter entity!
							fallingLetters.current.push({
								x: r.left + r.width / 2,
								y: r.top + r.height / 2,
								vx: b.vx * 0.22 + (Math.random() - 0.5) * 160,
								vy: -160 - Math.random() * 140,
								char: target.char,
								color: b.color,
								fontSize: target.computedStyle.fontSize || "20px",
								fontFamily: target.computedStyle.fontFamily || "monospace",
								rotation: (Math.random() - 0.5) * 0.5,
								vRot: (Math.random() - 0.5) * 7,
								life: 7.0,
								bounces: 0,
							});

							// Spark particles
							for (let k = 0; k < 10; k++) {
								particles.current.push({
									x: r.left + r.width / 2,
									y: r.top + r.height / 2,
									vx: (Math.random() - 0.5) * 240,
									vy: (Math.random() - 0.5) * 240,
									color: b.color,
									char: target.char,
									life: 0.7,
								});
							}
							break;
						}
					}

					if (
						hitLetter ||
						b.life <= 0 ||
						b.x < -50 ||
						b.x > window.innerWidth + 50 ||
						b.y < -50 ||
						b.y > window.innerHeight + 50
					) {
						bullets.current.splice(i, 1);
						continue;
					}

					// Draw Flying Alphabet Bullet
					ctx.save();
					ctx.translate(b.x, b.y);
					ctx.rotate(b.rotation);
					ctx.shadowColor = b.color;
					ctx.shadowBlur = 10;

					ctx.fillStyle = b.color;
					ctx.font = "bold 20px 'Pixelify Sans', monospace";
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.fillText(b.char, 0, 0);

					ctx.beginPath();
					ctx.arc(-10, 0, 3, 0, Math.PI * 2);
					ctx.fillStyle = "#ffffff";
					ctx.fill();
					ctx.restore();
				}

				// E. Update & Draw Falling Letters that were knocked loose!
				for (let i = fallingLetters.current.length - 1; i >= 0; i--) {
					const l = fallingLetters.current[i];
					l.vy += GRAVITY * dt;
					l.vx *= 0.99;

					l.x += l.vx * dt;
					l.y += l.vy * dt;
					l.rotation += l.vRot * dt;
					l.life -= dt;

					// Bounce and settle on the floor
					if (l.y >= floorY) {
						l.y = floorY;
						if (Math.abs(l.vy) > 70) {
							l.vy = -l.vy * 0.42;
							l.vx *= 0.7;
							l.vRot *= 0.7;
							if (l.bounces < 2) {
								audioEngine.playStep();
								l.bounces += 1;
							}
						} else {
							l.vy = 0;
							l.vx *= 0.85;
							l.vRot *= 0.85;
						}
					}

					// Wall bounces
					if (l.x < 20) {
						l.x = 20;
						l.vx = -l.vx * 0.55;
					} else if (l.x > window.innerWidth - 20) {
						l.x = window.innerWidth - 20;
						l.vx = -l.vx * 0.55;
					}

					if (l.life <= 0) {
						fallingLetters.current.splice(i, 1);
						continue;
					}

					ctx.save();
					ctx.translate(l.x, l.y);
					ctx.rotate(l.rotation);

					const alpha = Math.min(1, l.life / 1.5);
					ctx.globalAlpha = Math.max(alpha, 0);
					ctx.shadowColor = l.color;
					ctx.shadowBlur = 12;

					ctx.fillStyle = l.color;
					ctx.font = `bold ${l.fontSize} ${l.fontFamily}`;
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.fillText(l.char, 0, 0);
					ctx.restore();
				}

				// F. Update & Draw Impact Particles
				for (let i = particles.current.length - 1; i >= 0; i--) {
					const p = particles.current[i];
					p.x += p.vx * dt;
					p.y += p.vy * dt;
					p.life -= dt * 1.5;

					if (p.life <= 0) {
						particles.current.splice(i, 1);
						continue;
					}

					ctx.save();
					ctx.globalAlpha = Math.max(p.life, 0);
					ctx.fillStyle = p.color;
					ctx.font = "12px monospace";
					ctx.fillText(p.char || "•", p.x, p.y);
					ctx.restore();
				}
			}

			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [isActive, isAirShooter, isTouchDevice, triggerWarp, getNextRoute, getPrevRoute, location.pathname]);

	// Handle window resize
	useEffect(() => {
		const handleResize = () => {
			if (canvasRef.current) {
				canvasRef.current.width = window.innerWidth;
				canvasRef.current.height = window.innerHeight;
			}
		};
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Mobile Touch Drag to Aim & Shoot ("without controller")
	const handleScreenTouch = (e) => {
		if (!isActive || !isTouchDevice) return;
		const touch = e.touches[0];
		if (touch) {
			aimPos.current = { x: touch.clientX, y: touch.clientY };
			shootAlphabet(touch.clientX, touch.clientY);
		}
	};

	// Mobile D-Pad Move ("with controller")
	const handleDpadMove = (dx, dy) => {
		velocity.current.vx += dx * 340;
		velocity.current.vy += dy * 340;
		audioEngine.playStep();
	};

	if (!isActive) {
		return (
			<div className="fixed bottom-4 right-4 z-40">
				<button
					type="button"
					onClick={() => {
						setIsActive(true);
						try {
							sessionStorage.setItem("avatar_companion_active", "true");
						} catch (e) {}
					}}
					className="pixelify-sans bg-gray-900/90 border border-yellow-400 text-yellow-400 text-xs px-3 py-2 rounded-lg hover:bg-yellow-400 hover:text-[#00234b] transition-all shadow-lg flex items-center gap-2"
				>
					<span>🤖 SUMMON BYTE COMPANION</span>
					<span className="text-[10px] text-gray-400">[SHIFT 3x]</span>
				</button>
			</div>
		);
	}

	return (
		<>
			{/* Transparent Canvas for Bullets, Falling Knocked-Out Letters, Particles & Warp Barrier */}
			<canvas
				ref={canvasRef}
				className="fixed inset-0 z-30 pointer-events-none"
			/>

			{/* Fullscreen Warp Jump Transition Overlay */}
			{warpTransition.active && (
				<div
					className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-cyan-950/40 backdrop-blur-[2px] transition-all duration-300 ${
						warpTransition.direction === "right" ? "animate-pulse" : "animate-pulse"
					}`}
				>
					<div className="bg-gray-950/90 border-2 border-yellow-400 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(250,204,21,0.8)] font-mono text-center flex flex-col items-center gap-2">
						<div className="text-2xl animate-bounce">⚡ 🚀 ⚡</div>
						<div className="text-yellow-300 font-bold text-sm tracking-wider">
							HYPERSPACE WARP ENGAGED
						</div>
						<div className="text-cyan-400 text-xs font-semibold">
							ENTERING {warpTransition.targetLabel.toUpperCase()}...
						</div>
					</div>
				</div>
			)}

			{/* Border Warp Charging Progress HUD Widget */}
			{warpChargeInfo.active && (
				<div
					style={{
						position: "fixed",
						top: "50%",
						[warpChargeInfo.direction === "right" ? "right" : "left"]: 24,
						transform: "translateY(-50%)",
						zIndex: 42,
					}}
					className="bg-gray-950/95 border-2 border-cyan-400 p-4 rounded-xl shadow-[0_0_25px_rgba(56,189,248,0.7)] font-mono text-center pointer-events-none animate-fadeIn"
				>
					<div className="text-cyan-400 font-bold text-xs flex items-center justify-center gap-2 mb-1">
						<span className="animate-spin text-sm">⌖</span>
						<span>WARPING: {warpChargeInfo.direction.toUpperCase()} BORDER</span>
					</div>
					<div className="text-white text-xs font-bold mb-2">
						DESTINATION: <span className="text-yellow-400">{warpChargeInfo.targetLabel}</span>
					</div>

					{/* 5-Second Charging Bar */}
					<div className="w-52 h-3.5 bg-gray-900 rounded-full border border-gray-700 overflow-hidden mb-1.5 p-0.5">
						<div
							className="h-full bg-gradient-to-r from-cyan-400 via-yellow-400 to-emerald-400 rounded-full transition-all duration-75"
							style={{ width: `${Math.round(warpChargeInfo.progress * 100)}%` }}
						/>
					</div>

					<div className="flex justify-between text-[11px] text-gray-300">
						<span>{warpChargeInfo.timer.toFixed(1)}s / 5.0s</span>
						<span className="text-yellow-300 font-bold">
							{Math.round(warpChargeInfo.progress * 100)}%
						</span>
					</div>

					<div className="text-[10px] text-cyan-300/90 mt-1 animate-pulse">
						HOLD {warpChargeInfo.direction.toUpperCase()} TO JUMP PAGE
					</div>
				</div>
			)}

			{/* Aiming Reticle (Crosshair follows mouse cursor) */}
			{!isTouchDevice && (
				<div
					ref={reticleElRef}
					style={{
						position: "fixed",
						left: 0,
						top: 0,
						marginLeft: -12,
						marginTop: -12,
						width: 24,
						height: 24,
						pointerEvents: "none",
						zIndex: 34,
						willChange: "transform",
					}}
					className="flex items-center justify-center text-cyan-400 text-lg font-bold select-none"
				>
					<span className="animate-spin text-sm">⌖</span>
				</div>
			)}

			{/* Top Control HUD */}
			<div className="fixed top-20 right-4 z-40 flex flex-col items-end gap-2 font-mono text-xs pointer-events-auto">
				<div className="bg-gray-900/90 border border-yellow-400 px-3 py-1.5 rounded text-yellow-300 shadow-md flex items-center gap-2">
					<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
					<span>BYTE: WASD FLIGHT • CURSOR AIM • PUSH BORDERS 5s TO WARP PAGES</span>
					<span className="text-emerald-400 font-bold ml-2">
						KNOCKED: {knockedCount} • SCORE: {score}
					</span>
				</div>

				<div className="flex gap-2">
					{knockedCount > 0 && (
						<button
							type="button"
							onClick={repairPage}
							className="px-2.5 py-1 bg-yellow-400 text-[#00234b] font-bold rounded text-[11px] hover:bg-yellow-300 transition-colors shadow"
						>
							🔧 REPAIR TEXT [R]
						</button>
					)}

					<button
						type="button"
						onClick={() => setIsAirShooter((prev) => !prev)}
						className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
							isAirShooter
								? "bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
								: "bg-gray-800 text-gray-300 border-gray-600 hover:border-yellow-400"
						}`}
					>
						{isAirShooter ? "🚀 SHOOTER: ACTIVE" : "✈️ ACTIVATE SHOOTER [SHIFT 3x]"}
					</button>

					<button
						type="button"
						onClick={() => {
							setIsActive(false);
							try {
								sessionStorage.removeItem("avatar_companion_active");
								sessionStorage.removeItem("avatar_contact_active");
							} catch (e) {}
						}}
						className="px-2 py-1 bg-gray-800 hover:bg-red-900/80 text-gray-400 hover:text-white rounded text-[11px] border border-gray-700"
					>
						✕ DISMISS
					</button>
				</div>
			</div>

			{/* Speech Bubble (Always stays upright above bot) */}
			{speech && (
				<div
					ref={speechElRef}
					style={{
						position: "fixed",
						left: 0,
						top: 0,
						transform: `translate(${botPos.current.x}px, ${botPos.current.y - 38}px) translateX(-50%)`,
						pointerEvents: "none",
						zIndex: 36,
						background: "#0f172a",
						border: "1px solid #FACC15",
						color: "#FACC15",
						fontFamily: "monospace",
						fontSize: "11px",
						padding: "6px 10px",
						borderRadius: "6px",
						whiteSpace: "nowrap",
						boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
						willChange: "transform",
					}}
				>
					{speech}
				</div>
			)}

			{/* The Bot (Controlled by WASD/Arrows, Points to Mouse Cursor with Turret Swivel & Agile Banking Tilt) */}
			<div
				ref={botElRef}
				style={{
					position: "fixed",
					left: 0,
					top: 0,
					marginLeft: -18,
					marginTop: -18,
					pointerEvents: "none",
					zIndex: 35,
					willChange: "transform",
				}}
			>
				{/* Bot Pixel Art Graphic */}
				<div className="relative select-none">
					{isAirShooter && (
						<div className="absolute -inset-2 rounded-full bg-cyan-400/25 blur-sm animate-pulse" />
					)}

					<div
						ref={chassisElRef}
						className={`relative p-1 rounded-md transition-[box-shadow,background] ${
							isAirShooter
								? "bg-gradient-to-t from-cyan-600 to-indigo-900 border border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
								: "bg-gray-900 border border-yellow-400 shadow-md"
						}`}
						style={{ width: 36, height: 36, willChange: "transform" }}
					>
						{/* Front Blaster Cannon pointing right (0 deg) */}
						<div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-1.5 bg-yellow-400 rounded-r">
							<div className="w-1.5 h-1.5 bg-cyan-300 animate-pulse ml-auto" />
						</div>

						{/* Robot Visor / Eyes */}
						<div className="w-full h-3 bg-black rounded mt-1.5 flex items-center justify-center gap-1.5 px-1">
							<div
								className={`w-1.5 h-1.5 rounded-full ${
									isAirShooter ? "bg-red-400 animate-pulse" : "bg-cyan-400"
								}`}
							/>
							<div
								className={`w-1.5 h-1.5 rounded-full ${
									isAirShooter ? "bg-red-400 animate-pulse" : "bg-cyan-400"
								}`}
							/>
						</div>

						{/* Body Details */}
						<div className="mt-1 flex items-center justify-between text-[8px] font-mono text-yellow-300">
							<span>⚡</span>
							<span>MA</span>
						</div>
					</div>

					{/* Rear Rocket Thruster Flame with Dynamic Speed Scaling */}
					<div
						ref={thrusterElRef}
						className="absolute -left-3 top-1/2 -translate-y-1/2 flex items-center origin-right transition-transform duration-75"
					>
						<span className="text-[12px] leading-none">🔥</span>
					</div>
				</div>
			</div>

			{/* Mobile Touch Area & Controller ("with and without controller in mobile") */}
			{isTouchDevice && (
				<>
					{/* Invisible background touch layer for "without controller" tap to aim & shoot */}
					<div
						className="fixed inset-0 z-20"
						style={{ pointerEvents: "none" }}
						onTouchStart={handleScreenTouch}
					/>

					{/* Mobile Controller Toggle Button */}
					<div className="fixed bottom-4 left-4 z-40 pointer-events-auto">
						<button
							type="button"
							onClick={() => setShowMobileController((prev) => !prev)}
							className="pixelify-sans bg-gray-900/90 border border-yellow-400 text-yellow-400 text-xs px-3 py-1.5 rounded shadow-lg"
						>
							{showMobileController ? "🕹️ HIDE CONTROLLER" : "🕹️ SHOW CONTROLLER"}
						</button>
					</div>

					{/* On-Screen Mobile Controller ("with controller") */}
					{showMobileController && (
						<div className="fixed bottom-14 left-4 z-40 bg-gray-950/95 border-2 border-yellow-400 p-3 rounded-xl shadow-2xl backdrop-blur font-mono pointer-events-auto">
							<div className="text-[10px] text-yellow-400 text-center mb-1 font-bold">
								BYTE CONTROLLER
							</div>

							<div className="flex items-center gap-4">
								{/* D-PAD */}
								<div className="grid grid-cols-3 gap-1 w-28 h-28 p-1 bg-gray-900 rounded-lg border border-gray-700 select-none">
									<div />
									<button
										type="button"
										onPointerDown={() => { moveKeys.current.up = true; handleDpadMove(0, -1); }}
										onPointerUp={() => { moveKeys.current.up = false; }}
										onPointerLeave={() => { moveKeys.current.up = false; }}
										className="bg-gray-800 active:bg-yellow-400 active:text-black border border-gray-600 rounded flex items-center justify-center text-white font-bold select-none"
									>
										▲
									</button>
									<div />
									<button
										type="button"
										onPointerDown={() => { moveKeys.current.left = true; handleDpadMove(-1, 0); }}
										onPointerUp={() => { moveKeys.current.left = false; }}
										onPointerLeave={() => { moveKeys.current.left = false; }}
										className="bg-gray-800 active:bg-yellow-400 active:text-black border border-gray-600 rounded flex items-center justify-center text-white font-bold select-none"
									>
										◀
									</button>
									<div className="bg-gray-950 rounded flex items-center justify-center text-[8px] text-gray-500">
										•
									</div>
									<button
										type="button"
										onPointerDown={() => { moveKeys.current.right = true; handleDpadMove(1, 0); }}
										onPointerUp={() => { moveKeys.current.right = false; }}
										onPointerLeave={() => { moveKeys.current.right = false; }}
										className="bg-gray-800 active:bg-yellow-400 active:text-black border border-gray-600 rounded flex items-center justify-center text-white font-bold select-none"
									>
										▶
									</button>
									<div />
									<button
										type="button"
										onPointerDown={() => { moveKeys.current.down = true; handleDpadMove(0, 1); }}
										onPointerUp={() => { moveKeys.current.down = false; }}
										onPointerLeave={() => { moveKeys.current.down = false; }}
										className="bg-gray-800 active:bg-yellow-400 active:text-black border border-gray-600 rounded flex items-center justify-center text-white font-bold select-none"
									>
										▼
									</button>
									<div />
								</div>

								{/* Action / Fire Button */}
								<div className="flex flex-col gap-2 items-center">
									<button
										type="button"
										onClick={() => shootAlphabet()}
										className="w-14 h-14 rounded-full bg-red-600 active:bg-red-400 border-2 border-red-300 text-white font-bold text-xs shadow-lg flex flex-col items-center justify-center"
									>
										<span>FIRE</span>
										<span className="text-[9px]">🅰</span>
									</button>
									{knockedCount > 0 && (
										<button
											type="button"
											onClick={repairPage}
											className="px-2 py-1 bg-yellow-400 text-black text-[9px] font-bold rounded"
										>
											REPAIR
										</button>
									)}
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</>
	);
}
