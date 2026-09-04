import protfolio from "./assets/images/portfolio.png";
import aboutME from "./assets/images/aboutme.png";
import skills from "./assets/images/skillss.png";
import homeBG from "./assets/images/homePage.png";
import projects from "./assets/images/resized-projects300.png";

import { Link } from "react-router-dom";
import { gsap, useRetro, STEPS, PIXEL, spriteBob } from "../lib/retro";

export default function Hero() {
	const scope = useRetro(() => {
		// Title drops in first, then the menu entries arrive one at a time like
		// an arcade attract screen building itself.
		const tl = gsap.timeline();
		tl.from("[data-retro='logo']", {
			opacity: 0,
			y: -14,
			duration: 0.5,
			ease: STEPS.enter,
			snap: PIXEL,
		}).from(
			"[data-retro='menu-item']",
			{
				opacity: 0,
				x: -12,
				duration: 0.35,
				ease: STEPS.enter,
				stagger: 0.12,
				snap: PIXEL,
			},
			"-=0.1"
		);

		// Once seated, the entries breathe on a two-frame loop.
		spriteBob("[data-retro='menu-item']", { amount: 2, stagger: 0.25 });
	});

	return (
		<div
			ref={scope}
			className="flex justify-center items-center min-h-screen min-h-[100svh] w-full px-4"
			style={{
				backgroundColor: "#00234b",
				backgroundImage: `url(${homeBG})`,
				backgroundRepeat: `no-repeat`,
				backgroundSize: `cover`,
			}}
		>
			{/* The menu is pixel-art text, so the real headings live here for
			    screen readers and search engines. */}
			<h1 className="sr-only">
				Muhammed Adnaan Ur Rahmaan — Software Engineer &amp; Web Developer
			</h1>
			<div className="flex flex-col items-center">
				<div className="m-10 md:m-20 p-5" data-retro="logo">
					<img src={protfolio} alt="Portfolio" className="max-w-full" />
				</div>
				<div className="flex justify-center">
					<div className="hover:bg-yellow-400" data-retro="menu-item">
						<Link to="/about">
							<img src={aboutME} alt="About me" className="max-w-full" />
						</Link>
					</div>
				</div>
				<div className="flex justify-center">
					<div className="hover:bg-yellow-400" data-retro="menu-item">
						<Link to="/projects">
							<img src={projects} alt="Projects" className="max-w-full" />
						</Link>
					</div>
				</div>
				<div className="flex justify-center">
					<div className="hover:bg-yellow-400" data-retro="menu-item">
						<Link to="/skills">
							<img src={skills} alt="Skills" className="max-w-full" />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
