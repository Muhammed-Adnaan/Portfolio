import React from "react";
import { Link } from "react-router-dom";
import ArrowLeft from "../assets/images/arrow-right.png";

// Import all Medicare project images
import medicareProfile from "../assets/images/project-pics/medihub/Medicare-profile.png";
import screenshot1 from "../assets/images/project-pics/medihub/Screenshot 2025-05-14 182742.png";
import screenshot2 from "../assets/images/project-pics/medihub/Screenshot 2025-05-14 182819.png";
import screenshot3 from "../assets/images/project-pics/medihub/Screenshot 2025-05-14 182853.png";
import screenshot4 from "../assets/images/project-pics/medihub/Screenshot 2025-05-14 185253.png";
import screenshot5 from "../assets/images/project-pics/medihub/Screenshot 2025-05-14 185304.png";
import screenshot6 from "../assets/images/project-pics/medihub/Screenshot 2025-05-14 185313.png";
import screenshot7 from "../assets/images/project-pics/medihub/Screenshot 2025-05-14 185323.png";
import screenshot8 from "../assets/images/project-pics/medihub/Screenshot 2025-05-14 185343.png";
import screenshot9 from "../assets/images/project-pics/medihub/Screenshot 2025-05-14 185356.png";
import screenshot10 from "../assets/images/project-pics/medihub/Screenshot 2025-05-14 185535.png";
import screenshot11 from "../assets/images/project-pics/medihub/Screenshot 2025-05-14 190840.png";
import screenshot12 from "../assets/images/project-pics/medihub/Screenshot 2025-05-14 190854.png";
import screenshot13 from "../assets/images/project-pics/medihub/Screenshot 2025-05-14 190901.png";

export default function MedicareProject() {
	const projectInfo = {
		title: "MediHub - Healthcare Management System",
		description:
			"A comprehensive healthcare management application designed to streamline medical processes and provide easy access to healthcare information and services. Features secure data handling, user-friendly interface, and comprehensive medical record management.",
		techStack: [
			"J2EE",
			"Apache Tomcat",
			"JSP",
			"Servlet",
			"JDBC",
			"MySQL",
			"HTML",
			"CSS",
			"JavaScript",
		],
		features: [
			"Patient record management system",
			"Secure medical data handling",
			"User-friendly healthcare interface",
			"Appointment scheduling system",
			"Medical information database",
			"Responsive design for all devices",
		],
		images: [
			{ src: medicareProfile, alt: "MediHub Profile", size: "large" },
			{ src: screenshot1, alt: "Hero Overview", size: "medium" },
			{ src: screenshot3, alt: "Admin Login", size: "small" },
			{ src: screenshot4, alt: "Admin Dashboard", size: "small" },
			{ src: screenshot2, alt: "Hero Section", size: "medium" },
			{ src: screenshot6, alt: "Admin Add Doctor", size: "vsmall" },
			{ src: screenshot5, alt: "Admin Add specialist", size: "medium" },
			{
				src: screenshot7,
				alt: "Admin doctor Management ",
				size: "medium",
			},
			{ src: screenshot8, alt: "Admin Patient Management", size: "medium" },
			{ src: screenshot9, alt: "Doctor Appointment Dashboard", size: "vsmall" },
			{ src: screenshot10, alt: "Doctor Dashboard", size: "medium" },
			{ src: screenshot11, alt: "Doctor Login", size: "vsmall" },
			{ src: screenshot12, alt: "Patient Login", size: "vsmall" },
			{ src: screenshot13, alt: "Patient Register", size: "vsmall" },
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
				<div className="grid grid-cols-9 gap-4 auto-rows-[200px]">
					{projectInfo.images.map((image, index) => (
						<div
							key={index}
							className={`relative group overflow-hidden rounded-lg border-2 border-gray-700 hover:border-yellow-500 transition-all duration-300 cursor-pointer ${
								image.size === "large"
									? "col-span-9 row-span-2"
									: image.size === "medium"
									? "col-span-6 row-span-1"
									: image.size === "vsmall"
									? "col-span-3 row-span-2"
									: "col-span-3 row-span-1"
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
					href="https://github.com/Muhammed-Adnaan/Medicare"
					className="px-6 py-3 bg-yellow-400 text-[#00234b] rounded-lg font-bold hover:bg-yellow-300 transition-colors duration-300"
				>
					View Source Code
				</a>
			</div>
		</div>
	);
}
