import React from "react";
import { Link } from "react-router-dom";
import ArrowLeft from "../assets/images/arrow-right.png";

// Import all Quill Chat App project images
import quillProfile from "../assets/images/project-pics/chatApp/quillProfile.png";
import screenshot1 from "../assets/images/project-pics/chatApp/Screenshot 2024-03-17 213717.png";
import screenshot2 from "../assets/images/project-pics/chatApp/Screenshot 2024-03-17 213815.png";
import screenshot3 from "../assets/images/project-pics/chatApp/Screenshot 2024-03-18 074244.png";
import screenshot4 from "../assets/images/project-pics/chatApp/Screenshot 2024-03-18 074344.png";
import screenshot5 from "../assets/images/project-pics/chatApp/Screenshot 2024-03-18 074401.png";
import screenshot6 from "../assets/images/project-pics/chatApp/Screenshot 2024-03-18 074420.png";

export default function QuillProject() {
	const projectInfo = {
		title: "Quill - Real-time Chat Application",
		description:
			"A secure web-based real-time chat application with advanced features including user authentication, admin panel for user management, and full responsiveness across all devices. Built with modern web technologies and real-time communication protocols.",
		techStack: [
			"React",
			"Node.js",
			"Socket.io",
			"Express.js",
			"MySql",
			"Real-time Communication",
		],
		features: [
			"Real-time messaging with Socket.io",
			"Secure user authentication system",
			"Admin panel for user management",
			"Responsive design for all devices",
			"Message history and persistence",
			"User status and online indicators",
		],
		images: [
			{ src: quillProfile, alt: "Quill Chat App Profile", size: "large" },
			{ src: screenshot1, alt: "Chat Interface", size: "small" },
			{ src: screenshot2, alt: "User Authentication", size: "medium" },
			{ src: screenshot3, alt: "Real-time Messaging", size: "medium" },
			{ src: screenshot5, alt: "User Management", size: "small" },
			{ src: screenshot4, alt: "Admin Dashboard", size: "small" },
			{ src: screenshot6, alt: "Mobile Responsive", size: "medium" },
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
					href="https://github.com/Muhammed-Adnaan/Chat-App"
					className="px-6 py-3 bg-yellow-400 text-[#00234b] rounded-lg font-bold hover:bg-yellow-300 transition-colors duration-300"
				>
					View Source Code
				</a>
			</div>
		</div>
	);
}
