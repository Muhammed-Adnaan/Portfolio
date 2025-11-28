import AdnaanResumePDF from "../components/assets/Resume/AdnaanResume.pdf";
import homeBG from "./assets/images/homePage.png";
export default function Resume() {
	// Use the URL for a remote file or the path for a local file in the public folder
	const pdfFile = AdnaanResumePDF; // Example: '/sample.pdf'
	const divStyle = {
		backgroundImage: `url(${homeBG})`,
		height: "100vh", // Make sure to quote '100vh' (View Height)
	};

	return (
		<div style={divStyle} className="flex justify-center items-center">
			<div style={{ padding: "20px" }}>
				{/* The key is the iframe tag:
        - src: Points to the public URL of the PDF.
        - type: Specifies the content is a PDF.
        - width/height: Set the dimensions of the frame.
		*/}
				<iframe
					src={pdfFile}
					type="application/pdf"
					width="1000px"
					height="600px"
					title="Resume"
					className="pt-5"
				>
					{/* Fallback text for browsers that don't support iframes or PDF viewing */}
					<p>
						Your browser does not support iframes. You can{" "}
						<a href={pdfFile} download>
							download the PDF
						</a>{" "}
						instead.
					</p>
				</iframe>
			</div>
		</div>
	);
}
