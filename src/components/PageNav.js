import { Link } from "react-router-dom";
import ArrowRight from "./assets/images/arrow-right.png";

/**
 * Previous / next links shared by the About, Projects and Skills pages.
 * Both sides are optional so the ends of the tour can omit one.
 */
export default function PageNav({ prev, next }) {
	return (
		<div className="w-full mt-16 flex items-center justify-between gap-4">
			{prev ? (
				<Link
					to={prev.to}
					className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
				>
					<img src={ArrowRight} alt="" className="w-6 h-6 rotate-180" />
					<span className="text-lg md:text-xl">{prev.label}</span>
				</Link>
			) : (
				<span />
			)}
			{next ? (
				<Link
					to={next.to}
					className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
				>
					<span className="text-lg md:text-xl">{next.label}</span>
					<img src={ArrowRight} alt="" className="w-6 h-6" />
				</Link>
			) : (
				<span />
			)}
		</div>
	);
}
