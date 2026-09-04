import AdnaanResumePDF from "./assets/Resume/AdnaanResume.pdf";
import homeBG from "./assets/images/homePage.png";

export default function Resume() {
	return (
		<div
			className="pixelify-sans min-h-screen min-h-[100svh] w-full flex flex-col items-center pt-24 pb-12 px-4"
			style={{
				backgroundImage: `url(${homeBG})`,
				backgroundRepeat: "no-repeat",
				backgroundSize: "cover",
				backgroundAttachment: "fixed",
			}}
		>
			{/* Mobile browsers largely refuse to render PDFs in an iframe, so the
			    download link is the primary path and the preview is a bonus. */}
			<div className="flex flex-wrap gap-4 justify-center mb-6">
				<a
					href={AdnaanResumePDF}
					download="Muhammed-Adnaan-Resume.pdf"
					className="px-6 py-3 bg-yellow-400 text-[#00234b] rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors duration-300"
				>
					Download Resume
				</a>
				<a
					href={AdnaanResumePDF}
					target="_blank"
					rel="noopener noreferrer"
					className="px-6 py-3 border-2 border-yellow-400 text-yellow-400 rounded-lg font-bold text-lg hover:bg-yellow-400 hover:text-[#00234b] transition-colors duration-300"
				>
					Open in new tab
				</a>
			</div>

			<div className="hidden md:block w-full max-w-5xl">
				<iframe
					src={AdnaanResumePDF}
					title="Resume"
					className="w-full h-[80vh] rounded-lg border-2 border-yellow-400 bg-white"
				>
					<p>
						Your browser can't display PDFs.{" "}
						<a href={AdnaanResumePDF} download>
							Download the PDF
						</a>{" "}
						instead.
					</p>
				</iframe>
			</div>
		</div>
	);
}
