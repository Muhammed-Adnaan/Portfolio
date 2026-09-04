import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import homeBG from "./assets/images/homePage.png";
import { prefersReducedMotion } from "../lib/retro";

/**
 * A small walkable room that doubles as the site's landing page.
 *
 * Geometry is authored in fixed "logical pixels" and the whole room is scaled
 * with a single transform, so every coordinate below stays a whole number and
 * the art keeps its pixel grid at any screen size.
 *
 * The doors are real <Link>s: keyboard users can tab straight to them, crawlers
 * see ordinary anchors, and anyone who would rather not walk can just click.
 * Walking is an alternative to that, never a gate in front of it.
 */
const WORLD = { width: 320, height: 192 };
const WALL = 12;
const MAX_SCALE = 3;
const PLAYER = { width: 10, height: 14, speed: 82 };

const DOOR = { width: 66, height: 24 };
const DOORS = [
	{ to: "/about", label: "ABOUT", x: 20, y: 12 },
	{ to: "/projects", label: "PROJECTS", x: 127, y: 12 },
	{ to: "/skills", label: "SKILLS", x: 234, y: 12 },
	{ to: "/resume", label: "RESUME", x: 58, y: 156 },
	{ to: "/contact", label: "CONTACT", x: 196, y: 156 },
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
const ACTION_KEYS = new Set(["Enter", "Space", "KeyE"]);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const overlapsDoor = (player, door) =>
	player.x < door.x + DOOR.width &&
	player.x + PLAYER.width > door.x &&
	player.y < door.y + DOOR.height &&
	player.y + PLAYER.height > door.y;

/** Keys pressed while a link or button has focus belong to that control. */
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
	const position = useRef({ x: 155, y: 88 });
	const input = useRef({ up: false, down: false, left: false, right: false });
	const activeDoor = useRef(-1);
	const [doorIndex, setDoorIndex] = useState(-1);
	const [scale, setScale] = useState(1);

	// Scale the room to whatever width it is given.
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

	// Movement runs on its own loop and writes straight to the DOM: re-rendering
	// React 60 times a second to move one sprite would be wasteful.
	useEffect(() => {
		let frame;
		let previous = performance.now();

		const tick = (now) => {
			const delta = Math.min((now - previous) / 1000, 0.05);
			previous = now;

			const held = input.current;
			const dx = (held.right ? 1 : 0) - (held.left ? 1 : 0);
			const dy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
			const player = position.current;

			if (dx || dy) {
				// Diagonals would otherwise be faster than the cardinals.
				const length = Math.hypot(dx, dy);
				const step = PLAYER.speed * delta;
				player.x = clamp(
					player.x + (dx / length) * step,
					WALL,
					WORLD.width - WALL - PLAYER.width
				);
				player.y = clamp(
					player.y + (dy / length) * step,
					WALL,
					WORLD.height - WALL - PLAYER.height
				);
			}

			if (spriteRef.current) {
				// Whole pixels only, so the sprite never lands on a half pixel.
				spriteRef.current.style.transform = `translate(${Math.round(
					player.x
				)}px, ${Math.round(player.y)}px)`;
			}

			const found = DOORS.findIndex((door) => overlapsDoor(player, door));
			if (found !== activeDoor.current) {
				activeDoor.current = found;
				setDoorIndex(found);
			}

			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, []);

	useEffect(() => {
		const press = (event) => {
			const direction = MOVE_KEYS[event.code];
			if (direction) {
				input.current[direction] = true;
				event.preventDefault(); // arrows would otherwise scroll the page
				return;
			}
			if (ACTION_KEYS.has(event.code) && !isInteractive(event.target)) {
				const index = activeDoor.current;
				if (index >= 0) {
					event.preventDefault();
					navigate(DOORS[index].to);
					onExit();
				}
			}
		};

		const release = (event) => {
			const direction = MOVE_KEYS[event.code];
			if (direction) input.current[direction] = false;
		};

		// A key held while the tab loses focus would otherwise stick down.
		const clearInput = () => {
			input.current = { up: false, down: false, left: false, right: false };
		};

		window.addEventListener("keydown", press);
		window.addEventListener("keyup", release);
		window.addEventListener("blur", clearInput);
		return () => {
			window.removeEventListener("keydown", press);
			window.removeEventListener("keyup", release);
			window.removeEventListener("blur", clearInput);
		};
	}, [navigate, onExit]);

	const hold = useCallback(
		(direction, pressed) => (event) => {
			event.preventDefault();
			input.current[direction] = pressed;
		},
		[]
	);

	const enterDoor = useCallback(() => {
		const index = activeDoor.current;
		if (index < 0) return;
		navigate(DOORS[index].to);
		onExit();
	}, [navigate, onExit]);

	const current = doorIndex >= 0 ? DOORS[doorIndex] : null;
	const still = prefersReducedMotion();

	return (
		<div
			className="pixelify-sans relative min-h-full w-full flex flex-col items-center px-4 pt-6 pb-10"
			style={{
				backgroundColor: "#00234b",
				backgroundImage: `url(${homeBG})`,
				backgroundRepeat: "no-repeat",
				backgroundSize: "cover",
			}}
		>
			<div
				className="absolute inset-0 bg-[#00234b]/75"
				aria-hidden="true"
			/>

			<header className="relative mb-3 text-center">
				<p className="text-yellow-400 text-lg sm:text-2xl">
					★ SECRET MODE ★
				</p>
				<p className="text-white text-sm sm:text-base mt-1">
					Walk to a door to visit that section
				</p>
			</header>

			{/* The room */}
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
						className="absolute top-0 left-0 border-4 border-yellow-500"
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
						{DOORS.map((door, index) => {
							const active = index === doorIndex;
							return (
								<Link
									key={door.to}
									to={door.to}
									onClick={onExit}
									className="absolute flex items-center justify-center border-2 no-underline"
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
									}}
								>
									{door.label}
								</Link>
							);
						})}

						{/* Player sprite, built from blocks so it stays pixel-crisp */}
						<div
							ref={spriteRef}
							className="absolute top-0 left-0"
							style={{ width: PLAYER.width, height: PLAYER.height }}
						>
							<div
								className={still ? undefined : "animate-sprite-bob"}
								style={{ width: PLAYER.width, height: PLAYER.height }}
							>
								<div
									style={{
										position: "absolute",
										left: 1,
										top: 0,
										width: 8,
										height: 7,
										background: "#fde047",
									}}
								/>
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
								<div
									style={{
										position: "absolute",
										left: 0,
										top: 7,
										width: 10,
										height: 5,
										background: "#eab308",
									}}
								/>
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

			{/* Prompt */}
			<div className="relative h-9 mt-3 flex items-center" aria-live="polite">
				{current ? (
					<button
						type="button"
						onClick={enterDoor}
						className="px-4 py-1 bg-yellow-400 text-[#00234b] font-bold text-sm sm:text-base"
					>
						ENTER {current.label} ▸
					</button>
				) : (
					<p className="text-yellow-500 text-sm sm:text-base">
						<span className="hidden sm:inline">
							Move with WASD or the arrow keys
						</span>
						<span className="sm:hidden">Use the pad to move</span>
					</p>
				)}
			</div>

			{/* Touch controls */}
			<div className="relative mt-4 flex w-full max-w-xs items-center justify-between sm:hidden">
				<div
					className="grid grid-cols-3 gap-1"
					style={{ touchAction: "none" }}
					aria-hidden="true"
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
									className="h-12 w-12 bg-yellow-500 text-[#00234b] font-bold select-none"
								>
									{{ up: "▲", down: "▼", left: "◀", right: "▶" }[direction]}
								</button>
							) : (
								<span key={`${x}-${y}`} className="h-12 w-12" />
							)
						)
					)}
				</div>
				<button
					type="button"
					tabIndex={-1}
					onClick={enterDoor}
					style={{ touchAction: "none" }}
					className="h-16 w-16 rounded-full bg-yellow-400 text-[#00234b] text-xl font-bold select-none"
				>
					A
				</button>
			</div>

			{/* Every destination as a plain list, so nobody has to play to navigate. */}
			<nav className="relative mt-6 w-full max-w-lg" aria-label="Sections">
				<ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
					{DOORS.map((door) => (
						<li key={door.to}>
							<Link
								to={door.to}
								onClick={onExit}
								className="inline-flex items-center min-h-[44px] text-yellow-500 hover:text-yellow-300 text-lg"
							>
								{door.label}
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
}
