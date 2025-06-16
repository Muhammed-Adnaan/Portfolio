import { Link } from "react-router-dom";
import home from "./assets/images/home.png";

export default function Nav() {
	return (
		<div className="fixed top-0 left-0 w-full z-50 backdrop-blur-sm bg-white/5">
			<div className="flex mx-[50px] py-4 justify-between text-white">
				<div>
					<div className=" p-1  hover:bg-yellow-400">
						<Link to="/">
							<img src={home} alt="home page" className="h-10"></img>
						</Link>
					</div>
				</div>
				<div>
					<Link
						to="/resume"
						className="pixelify-sans text-4xl
 text-sky-700 hover:text-blue-500 transition-colors duration-200"
					>
						Resume
					</Link>
				</div>
			</div>
		</div>
	);
}
