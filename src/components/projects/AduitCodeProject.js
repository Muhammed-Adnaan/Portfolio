import React from "react";
import { Link } from "react-router-dom";
import ArrowLeft from "../assets/images/arrow-right.png";

// Import all AduitCode project images
import aduitProfile from "../assets/images/project-pics/aduitcode/aduitProfile.png";
import aduitThumb from "../assets/images/project-pics/aduitcode/aduitcodeThumb.png";
import screenshot1 from "../assets/images/project-pics/aduitcode/Screenshot 2024-07-29 161149.png";
import screenshot2 from "../assets/images/project-pics/aduitcode/Screenshot 2024-07-29 161538.png";
import screenshot3 from "../assets/images/project-pics/aduitcode/Screenshot 2024-07-29 161613.png";
import screenshot4 from "../assets/images/project-pics/aduitcode/Screenshot 2024-07-29 161850.png";
import screenshot5 from "../assets/images/project-pics/aduitcode/Screenshot 2024-07-29 161938.png";
import screenshot6 from "../assets/images/project-pics/aduitcode/Screenshot 2025-08-06 124040.png";

export default function AduitCodeProject() {
	const projectInfo = {
		title: "AduitCode - Code Editor and AI Assistant",
		description:
			"A comprehensive code editor with AI assistance features designed to streamline the teaching-learning process. Features include a parser system for code formatting, VS Code-like theme for Python files, and an efficient search system for folder navigation.",
		techStack: ["Python3", "Ollama", "Code Parsing", "QScintilla", "PyQt5"],
		features: [
			"Advanced code editor with syntax highlighting",
			"AI-powered code assistance and suggestions",
			"Custom VS Code-like theme for Python",
			"Efficient folder navigation system",
			"Code formatting and parsing capabilities",
			"Real-time collaboration features",
		],
		images: [
			{ src: aduitProfile, alt: "AduitCode Profile", size: "large" },
			{ src: aduitThumb, alt: "AduitCode Thumbnail", size: "medium" },
			{ src: screenshot2, alt: "AutoComplete", size: "small" },
			{ src: screenshot3, alt: "File Navigation", size: "small" },
			{ src: screenshot1, alt: "Code Editor Interface", size: "medium" },
			{ src: screenshot6, alt: "AI Assistant", size: "Lmedium" },
			{ src: screenshot4, alt: "Code Formatting", size: "small" },
			{ src: screenshot5, alt: "Fuzzy Search", size: "small" },
		],
	};

	return (
		<div className="pixelify-sans bg-[#00234b] min-h-screen w-full p-8 md:p-[100px] font-inter">
			{/* Header with back button */}
			<div className="flex items-center gap-4 mb-12">
				<Link
					to="/projects"
					className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
				>
					<img src={ArrowLeft} alt="Back" className="w-6 h-6 rotate-180" />
					<span className="text-xl">Back to Projects</span>
				</Link>
			</div>

			{/* Project Title and Description */}
			<div className="mb-12">
				<h1 className="text-white text-4xl md:text-6xl mb-6 font-bold">
					{projectInfo.title}
				</h1>
				<p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-4xl">
					{projectInfo.description}
				</p>
			</div>

			{/* Tech Stack */}
			<div className="mb-12">
				<h2 className="text-yellow-400 text-2xl md:text-3xl mb-4 font-bold">
					Tech Stack
				</h2>
				<div className="flex flex-wrap gap-3">
					{projectInfo.techStack.map((tech, index) => (
						<span
							key={index}
							className="px-4 py-2 bg-blue-900 text-blue-200 rounded-full text-sm font-medium border border-blue-700 hover:bg-blue-800 transition-colors duration-300"
						>
							{tech}
						</span>
					))}
				</div>
			</div>

			{/* Features */}
			<div className="mb-12">
				<h2 className="text-yellow-400 text-2xl md:text-3xl mb-4 font-bold">
					Key Features
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{projectInfo.features.map((feature, index) => (
						<div
							key={index}
							className="flex items-start gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-yellow-500 transition-colors duration-300"
						>
							<span className="text-yellow-400 text-lg">•</span>
							<span className="text-gray-300">{feature}</span>
						</div>
					))}
				</div>
			</div>

			{/* Bento Box Gallery */}
			<div className="mb-12">
				<h2 className="text-yellow-400 text-2xl md:text-3xl mb-6 font-bold">
					Project Gallery
				</h2>
				<div className="grid grid-cols-10 gap-4 auto-rows-[200px]">
					{projectInfo.images.map((image, index) => (
						<div
							key={index}
							className={`relative group overflow-hidden rounded-lg border-2 border-gray-700 hover:border-yellow-500 transition-all duration-300 cursor-pointer ${
								image.size === "large"
									? "col-span-10 row-span-2"
									: image.size === "medium"
									? "col-span-6 row-span-1"
									: image.size === "Lmedium"
									? "col-span-6 row-span-2"
									: "col-span-4 row-span-1"
							}`}
						>
							<img
								src={image.src}
								alt={image.alt}
								className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
							/>
							<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end">
								<div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<p className="text-sm font-medium">{image.alt}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Project Links */}
			<div className="flex flex-wrap gap-4">
				<a
					href="https://github.com/Muhammed-Adnaan/AduitCode"
					className="px-6 py-3 bg-yellow-400 text-[#00234b] rounded-lg font-bold hover:bg-yellow-300 transition-colors duration-300"
				>
					View Source Code
				</a>
			</div>
		</div>
	);
}
