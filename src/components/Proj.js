import { Link } from "react-router-dom";
import aduitcode from "./assets/images/project-pics/aduitcode/aduitProfile.png";
import Quill from "./assets/images/project-pics/chatApp/quillProfile.png";
import medicare from "./assets/images/project-pics/medihub/Medicare-profile.png";
import travel from "./assets/images/project-pics/travelBlog/TravelProfile.png";

export default function Proj() {
	// Define project data as an array of objects
	const projects = [
		{
			title: "AduitCode - Code Editor",
			image: aduitcode, // This refers to the uploaded image by its filename
			description:
				"Proposed a project to streamline teaching-learning, developed a parser system for code formatting, designed a VS Code-like theme for Python files, and created an efficient search system for folder navigation within the editor.",
		},
		{
			title: "Medicare",
			image: medicare, // Using the uploaded image for now
			description:
				"Developed a medical-related application to streamline healthcare processes, providing easy access to medical information and services. Focused on user-friendly interface and secure data handling.", // Placeholder description
		},
		{
			title: "Quill - Chat APP",
			image: Quill, // Using the uploaded image for now
			description:
				"Developed a web application for secure real-time text communication, integrated an admin panel for user management, gained experience with sockets and Node.js, and ensured full responsiveness across devices.",
		},
		{
			title: "Travel Blog Website",
			image: travel, // Using the uploaded image for now
			description:
				"Designed and built a website showcasing advanced CSS animation and foundational DBMS integration. Embedded 3D models for an immersive experience and implemented dynamic content management with full responsiveness.",
		},
	];

	return (
		<div className="pixelify-sans bg-[#00234b] min-h-screen w-full flex flex-col justify-start items-center p-8 md:p-[100px] font-inter">
			{/* Page Title */}
			<div className="text-white text-4xl md:text-6xl mb-12 self-start">
				Projects
			</div>

			{/* Projects Grid */}
			<div className="w-full  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
				{projects.map((project, index) => (
					<div
						key={index}
						className=" bg-black rounded-lg p-1" // Outer div for the green border effect
						style={{
							background: "linear-gradient(to bottom right, #eab308, #F3D26F)", // Green gradient for border
							boxShadow: "0 0 15px #006FEE, inset 0 0 15px #eab308", // Green glow effect
							borderRadius: "0.75rem", // Match rounded-lg
						}}
					>
						<div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden flex flex-col h-full transform transition-transform hover:scale-105 duration-300">
							{/* Project Image */}
							<div className="relative w-full p-4">
								{" "}
								{/* Added padding for the inner image card look */}
								<div className="  bg-gray-700 rounded-md overflow-hidden flex items-center justify-center hover:scale-105 duration-500 ">
									{" "}
									{/* Smaller, rounded inner image container */}
									<img
										src={`${project.image}`}
										alt={project.title}
										className="w-full h-full object-contain object-center" // Use object-contain to fit image within bounds
										onError={(e) => {
											e.target.onerror = null;
										}}
									/>
								</div>
							</div>

							{/* Project Content */}
							<div className="p-6 flex-grow flex flex-col">
								<h3 className="text-[#0F0] text-2xl font-bold mb-3 hover:text-4xl duration-500">
									{" "}
									{/* Green text for title */}
									{project.title}
								</h3>
								<p className="text-gray-300 text-lg leading-relaxed mb-4 flex-grow">
									{project.description}
								</p>
								{/* "Read more..." link */}
								<Link
									to={
										index === 0
											? "/projects/aduitcode"
											: index === 1
											? "/projects/medicare"
											: index === 2
											? "/projects/quill"
											: "/projects/travelblog"
									}
									className="text-blue-400 hover:underline self-end"
								>
									Read more...
								</Link>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
