import protfolio from "./assets/images/portfolio.png";
import aboutME from "./assets/images/aboutme.png";
import contact from "./assets/images/contact.png";
import skills from "./assets/images/skillss.png";
import homeBG from "./assets/images/homePage.png";
import projects from "./assets/images/resized-projects300.png";

import { Link } from "react-router-dom";

export default function Hero() {
	return (
		<div
			className="flex justify-center items-center h-screen w-auto"
			style={{
				backgroundImage: `url(${homeBG})`,
				backgroundRepeat: `no-repeat`,
				backgroundSize: `cover`,
			}}
		>
			<div className="">
				<div className="m-20 p-5 ">
					<Link to="/" className="h-50 w-10 ">
						<img src={protfolio} alt="Portfolio" className=""></img>
					</Link>
				</div>
				<div className="flex justify-center  ">
					<div className="hover:bg-yellow-400">
						<a href="/about" className="">
							<img src={aboutME} alt="AboutMe" className=""></img>
						</a>
					</div>
				</div>
				<div className="flex justify-center">
					<div className="hover:bg-yellow-400">
						<a href="/">
							<img src={projects} alt="Portfolio"></img>
						</a>
					</div>
				</div>
				<div className="flex justify-center">
					<div className="hover:bg-yellow-400">
						<a href="/">
							<img src={skills} alt="Portfolio"></img>
						</a>
					</div>
				</div>
				<div className="flex justify-center ">
					<div className="hover:bg-yellow-400">
						<a href="/">
							<img src={contact} alt="Portfolio"></img>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
