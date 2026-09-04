import { useCallback, useEffect, useRef, useState } from "react";
import HubWorld from "./HubWorld";

/**
 * Hidden entrance to the walkable hub.
 *
 * Desktop: tap Shift three times. Mobile: double-tap the page.
 *
 * Both listeners are deliberately fussy about what counts, because this runs on
 * every page and must never fire while someone is actually using the site:
 * Shift held down repeats, and a double-tap on a link is just an impatient
 * click. Taps are only counted on non-interactive targets, close together in
 * both time and space.
 */
const SHIFT_TAPS = 3;
const SHIFT_WINDOW = 800; // ms allowed between one Shift press and the next
const TAP_GAP = 350; // ms allowed between the two taps
const TAP_DISTANCE = 40; // px the second tap may land from the first

const isInteractive = (node) =>
	node instanceof HTMLElement &&
	node.closest("a, button, input, textarea, select, [contenteditable=true]");

export default function SecretHub() {
	const [open, setOpen] = useState(false);
	const shiftTaps = useRef(0);
	const lastShift = useRef(0);
	const lastTap = useRef(null);
	const dialog = useRef(null);
	const openerFocus = useRef(null);

	const close = useCallback(() => setOpen(false), []);

	useEffect(() => {
		const onKeyDown = (event) => {
			if (event.key === "Escape" && open) {
				setOpen(false);
				return;
			}
			// Holding Shift fires keydown over and over; only real presses count.
			if (event.key !== "Shift" || event.repeat || open) return;

			const now = Date.now();
			shiftTaps.current =
				now - lastShift.current > SHIFT_WINDOW ? 1 : shiftTaps.current + 1;
			lastShift.current = now;

			if (shiftTaps.current >= SHIFT_TAPS) {
				shiftTaps.current = 0;
				openerFocus.current = document.activeElement;
				setOpen(true);
			}
		};

		const onPointerUp = (event) => {
			if (event.pointerType !== "touch" || open) return;
			if (isInteractive(event.target)) return;

			const now = Date.now();
			const previous = lastTap.current;
			lastTap.current = { t: now, x: event.clientX, y: event.clientY };

			if (
				previous &&
				now - previous.t < TAP_GAP &&
				Math.hypot(event.clientX - previous.x, event.clientY - previous.y) <
					TAP_DISTANCE
			) {
				lastTap.current = null;
				openerFocus.current = document.activeElement;
				setOpen(true);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("pointerup", onPointerUp);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("pointerup", onPointerUp);
		};
	}, [open]);

	// Hold the page still behind the overlay and hand focus to the exit.
	useEffect(() => {
		if (!open) return undefined;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		dialog.current?.focus();
		return () => {
			document.body.style.overflow = previousOverflow;
			if (openerFocus.current instanceof HTMLElement) {
				openerFocus.current.focus();
			}
		};
	}, [open]);

	if (!open) return null;

	return (
		<div
			ref={dialog}
			role="dialog"
			aria-modal="true"
			aria-label="Secret hub world"
			tabIndex={-1}
			className="fixed inset-0 z-[100] overflow-y-auto bg-[#00234b] outline-none"
		>
			<button
				type="button"
				onClick={close}
				className="pixelify-sans fixed top-3 right-3 z-10 min-h-[44px] px-4 py-2 bg-yellow-400 text-[#00234b] font-bold"
			>
				EXIT ✕
			</button>
			<HubWorld onExit={close} />
		</div>
	);
}
