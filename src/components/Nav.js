import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import home from "./assets/images/home.png";

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
			setHidden(currentScroll > 0);
			lastScrollY.current = currentScroll;
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div
			className={`fixed top-0 left-0 w-full z-50 backdrop-blur-sm bg-white/5 transition-transform duration-300 ${
				hidden ? "-translate-y-full" : "translate-y-0"
			}`}
		>
			<div className="flex mx-[50px] py-4 justify-between text-white">
				<div>
					<div className=" p-1 h-10 w-10 rounded-[50%] hover:bg-yellow-400   duration-200 ">
						<Link to="/">
							<img
								src={home}
								alt="home page"
								className="h-10 rounded-[50%] "
							></img>
						</Link>
					</div>
				</div>
				<div>
					<Link
						to="/resume"
						className="pixelify-sans text-4xl text-yellow-500 hover:text-yellow-700 transition-colors duration-200"
					>
						Resume
					</Link>
				</div>
			</div>
		</div>
	);
}
