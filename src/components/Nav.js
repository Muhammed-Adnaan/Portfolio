import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import home from "./assets/images/home.png";
import { gsap, useRetro, STEPS, PIXEL, prefersReducedMotion } from "../lib/retro";

export default function Nav() {
	const [hidden, setHidden] = useState(false);
	const lastScrollY = useRef(0);

	useEffect(() => {
		if (typeof window === "undefined") {
			return undefined;
		}

		lastScrollY.current = window.scrollY;

		const handleScroll = () => {
			const currentScroll = window.scrollY;
			// Hide while scrolling down past the header, show again on any scroll up.
			setHidden(currentScroll > lastScrollY.current && currentScroll > 80);
			lastScrollY.current = currentScroll;
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scope = useRetro(() => {
		gsap.from("[data-retro='nav-item']", {
			opacity: 0,
			y: -10,
			duration: 0.4,
			ease: STEPS.enter,
			stagger: 0.08,
			snap: PIXEL,
		});
	});

	// A two-frame nudge on press, the way a selected menu entry kicks.
	const kick = (event) => {
		if (prefersReducedMotion()) return;
		gsap.fromTo(
			event.currentTarget,
			{ y: 0 },
			{ y: 2, duration: 0.08, ease: STEPS.bob, yoyo: true, repeat: 1 }
		);
	};

	return (
		<nav
			ref={scope}
			className={`fixed top-0 left-0 w-full z-50 backdrop-blur-sm bg-white/5 transition-transform duration-300 ${
				hidden ? "-translate-y-full" : "translate-y-0"
			}`}
		>
			<div className="flex mx-6 md:mx-[50px] py-4 justify-between items-center text-white">
				<Link
					to="/"
					aria-label="Home"
					data-retro="nav-item"
					onPointerDown={kick}
					className="flex items-center justify-center h-11 w-11 rounded-full hover:bg-yellow-400 duration-200"
				>
					<img src={home} alt="" className="h-9 w-9 rounded-full" />
				</Link>
				<div className="flex items-center gap-5 md:gap-8">
					<Link
						to="/contact"
						data-retro="nav-item"
						onPointerDown={kick}
						className="pixelify-sans text-2xl md:text-4xl text-yellow-500 hover:text-yellow-700 transition-colors duration-200 py-2 px-1 flex items-center min-h-[44px]"
					>
						Contact
					</Link>
					<Link
						to="/resume"
						data-retro="nav-item"
						onPointerDown={kick}
						className="pixelify-sans text-2xl md:text-4xl text-yellow-500 hover:text-yellow-700 transition-colors duration-200 py-2 px-1 flex items-center min-h-[44px]"
					>
						Resume
					</Link>
				</div>
			</div>
		</nav>
	);
}
