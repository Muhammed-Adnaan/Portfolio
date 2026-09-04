import protfolio from "./assets/images/portfolio.png";
import aboutME from "./assets/images/aboutme.png";
import skills from "./assets/images/skillss.png";
import homeBG from "./assets/images/homePage.png";
import projects from "./assets/images/resized-projects300.png";

import { Link } from "react-router-dom";

export default function Hero() {
	return (
		<div
			className="flex justify-center items-center min-h-screen min-h-[100svh] w-full px-4"
			style={{
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
				<div className="m-10 md:m-20 p-5">
					<img src={protfolio} alt="Portfolio" className="max-w-full" />
				</div>
				<div className="flex justify-center">
					<div className="hover:bg-yellow-400">
						<Link to="/about">
							<img src={aboutME} alt="About me" className="max-w-full" />
						</Link>
					</div>
				</div>
				<div className="flex justify-center">
					<div className="hover:bg-yellow-400">
						<Link to="/projects">
							<img src={projects} alt="Projects" className="max-w-full" />
						</Link>
					</div>
				</div>
				<div className="flex justify-center">
					<div className="hover:bg-yellow-400">
						<Link to="/skills">
							<img src={skills} alt="Skills" className="max-w-full" />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
