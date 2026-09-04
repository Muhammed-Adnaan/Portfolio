import { Link } from "react-router-dom";
import instaicon from "./assets/images/socialIcon/instagram.png";
import linkedinicon from "./assets/images/socialIcon/linkedin.png";
import github from "./assets/images/socialIcon/github.png";
import AdnaanResumePDF from "./assets/Resume/AdnaanResume.pdf";
import PageShell from "./PageShell";

const EMAIL = "muhammedadnaan233@gmail.com";

const LINKS = [
	{
		href: "https://github.com/Muhammed-Adnaan/",
		icon: github,
		label: "GitHub",
		handle: "@Muhammed-Adnaan",
	},
	{
		href: "https://linkedin.com/in/muhammed-adnaan-ur-rahmaan/",
		icon: linkedinicon,
		label: "LinkedIn",
		handle: "muhammed-adnaan-ur-rahmaan",
	},
	{
		href: "https://www.instagram.com/zen.adddy_/",
		icon: instaicon,
		label: "Instagram",
		handle: "@zen.adddy_",
	},
];

export default function Contact() {
	return (
		<PageShell>
			<div className="mb-12">
				<h1 className="text-white text-4xl md:text-6xl mb-6 font-bold">
					Get in touch
				</h1>
				<p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-3xl">
					I'm open to internships, full-time roles and freelance work. The
					fastest way to reach me is email — I usually reply within a day.
				</p>
			</div>

			<div className="flex flex-wrap gap-4 mb-12">
				<a
					href={`mailto:${EMAIL}`}
					className="w-full sm:w-auto text-center break-all px-6 py-3 bg-yellow-400 text-[#00234b] rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors duration-300"
				>
					{EMAIL}
				</a>
				<a
					href={AdnaanResumePDF}
					download="Muhammed-Adnaan-Resume.pdf"
					className="w-full sm:w-auto text-center px-6 py-3 border-2 border-yellow-400 text-yellow-400 rounded-lg font-bold text-lg hover:bg-yellow-400 hover:text-[#00234b] transition-colors duration-300"
				>
					Download Resume
				</a>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
				{LINKS.map((link) => (
					<a
						key={link.label}
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-4 bg-gray-900 rounded-lg p-6 border border-gray-700 hover:border-yellow-500 transition-colors duration-300"
					>
						<img src={link.icon} alt="" className="w-10 h-10 object-contain" />
						<div>
							<div className="text-white text-lg font-semibold">
								{link.label}
							</div>
							<div className="text-gray-400 text-sm break-all">
								{link.handle}
							</div>
						</div>
					</a>
				))}
			</div>

			<div className="mt-16">
				<Link
					to="/"
					className="inline-flex items-center py-2 min-h-[44px] text-yellow-400 hover:text-yellow-300 transition-colors duration-300 text-lg"
				>
					← Back to Home
				</Link>
			</div>
		</PageShell>
	);
}
