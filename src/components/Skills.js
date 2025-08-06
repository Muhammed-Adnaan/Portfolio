import React from "react";
import { Link } from "react-router-dom";
import ArrowLeft from "./assets/images/arrow-right.png";

export default function Skills() {
	const skillsData = {
		programmingLanguages: [
			{ name: "Python", icon: "🐍" },
			{ name: "Java", icon: "☕" },
			{ name: "JavaScript", icon: "📜" },
			{ name: "PHP", icon: "🐘" },
			{ name: "Rust", icon: "🦀" },
		],
		frontendTechnologies: [
			{ name: "React", icon: "⚛️" },
			{ name: "HTML5", icon: "🌐" },
			{ name: "CSS3", icon: "🎨" },
		],
		backendTechnologies: [
			{ name: "Node.js", icon: "🟢" },
			{ name: "Express.js", icon: "🚂" },
			{ name: "J2EE", icon: "☕" },
			{ name: "Apache Tomcat", icon: "🐱" },
			{ name: "JSP", icon: "📝" },
			{ name: "Servlet", icon: "🔧" },
		],
		databases: [
			{ name: "MySQL", icon: "🐬" },
			{ name: "MongoDB", icon: "🍃" },
			{ name: "JDBC", icon: "🔗" },
		],
		aiAndTools: [
			{ name: "Ollama", icon: "🤖" },
			{ name: "AI Integration", icon: "🧠" },
			{ name: "Code Parsing", icon: "🔍" },
			{ name: "QScintilla", icon: "📝" },
			{ name: "PyQt5", icon: "🐍" },
		],
		realTimeTechnologies: [{ name: "Socket.io", icon: "🔌" }],
		developmentTools: [
			{ name: "Git", icon: "📚" },
			{ name: "Expo", icon: "🚀" },
			{ name: "Figma", icon: "🎨" },
			{ name: "LaTeX", icon: "📄" },
			{ name: "XAMPP", icon: "🐘" },
		],
		softSkills: [
			{ name: "Problem Solving", icon: "🧩" },
			{ name: "Communica-tion", icon: "💬" },
			{ name: "Multitasking", icon: "⚡" },
			{ name: "Adaptability", icon: "🔄" },
			{ name: "Leadership", icon: "👑" },
			{ name: "Multilingual", icon: "🌍" },
		],
	};

	const SkillCard = ({ skill }) => (
		<div className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-yellow-500 transition-all duration-300 hover:scale-105">
			<div className="flex items-center gap-3 mb-3">
				<span className="text-3xl">{skill.icon}</span>
				<div className="flex-1">
					<h4 className="text-white font-semibold text-lg">{skill.name}</h4>
				</div>
			</div>
		</div>
	);

	const SkillCategory = ({ title, skills, color }) => (
		<div className="bg-gray-900 rounded-lg p-6 border border-gray-700 hover:border-yellow-500 transition-colors duration-300">
			<h3 className={`text-2xl font-bold mb-6 ${color}`}>{title}</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{skills.map((skill, index) => (
					<SkillCard key={index} skill={skill} />
				))}
			</div>
		</div>
	);

	return (
		<div className="pixelify-sans bg-[#00234b] min-h-screen w-full p-8 md:p-[100px] font-inter">
			{/* Header with back button */}
			<div className="flex items-center gap-4 mb-12">
				<Link
					to="/"
					className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
				>
					<img src={ArrowLeft} alt="Back" className="w-6 h-6 rotate-180" />
					<span className="text-xl">Back to Home</span>
				</Link>
			</div>

			{/* Page Title */}
			<div className="mb-12">
				<h1 className="text-white text-4xl md:text-6xl mb-6 font-bold">
					Skills & Expertise
				</h1>
				<p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-4xl">
					A comprehensive overview of my technical skills and competencies,
					developed through various projects and continuous learning.
				</p>
			</div>

			{/* Skills Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Programming Languages */}
				<SkillCategory
					title="Programming Languages"
					skills={skillsData.programmingLanguages}
					color="text-blue-400"
				/>

				{/* Frontend Technologies */}
				<SkillCategory
					title="Frontend Technologies"
					skills={skillsData.frontendTechnologies}
					color="text-green-400"
				/>

				{/* Backend Technologies */}
				<SkillCategory
					title="Backend Technologies"
					skills={skillsData.backendTechnologies}
					color="text-purple-400"
				/>

				{/* Databases */}
				<SkillCategory
					title="Databases & Data Management"
					skills={skillsData.databases}
					color="text-orange-400"
				/>

				{/* AI and Tools */}
				<SkillCategory
					title="AI & Development Tools"
					skills={skillsData.aiAndTools}
					color="text-pink-400"
				/>

				{/* Real-time Technologies */}
				<SkillCategory
					title="Real-time Technologies"
					skills={skillsData.realTimeTechnologies}
					color="text-cyan-400"
				/>

				{/* Development Tools */}
				<SkillCategory
					title="Development Tools & Platforms"
					skills={skillsData.developmentTools}
					color="text-indigo-400"
				/>

				{/* Soft Skills */}
				<SkillCategory
					title="Soft Skills & Competencies"
					skills={skillsData.softSkills}
					color="text-emerald-400"
				/>
			</div>

			{/* Additional Information */}
			<div className="mt-16 bg-gray-900 rounded-lg p-8 border border-gray-700">
				<h2 className="text-yellow-400 text-3xl font-bold mb-6">
					Technical Proficiency Summary
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="text-center">
						<div className="text-4xl font-bold text-yellow-400 mb-2">
							{skillsData.programmingLanguages.length}
						</div>
						<div className="text-gray-300">Programming Languages</div>
					</div>
					<div className="text-center">
						<div className="text-4xl font-bold text-yellow-400 mb-2">
							{skillsData.backendTechnologies.length}+
						</div>
						<div className="text-gray-300">Technologies & Tools</div>
					</div>
					<div className="text-center">
						<div className="text-4xl font-bold text-yellow-400 mb-2">4</div>
						<div className="text-gray-300">Major Projects Completed</div>
					</div>
				</div>
			</div>

			{/* Languages */}
			<div className="mt-8 bg-gray-900 rounded-lg p-8 border border-gray-700">
				<h2 className="text-yellow-400 text-3xl font-bold mb-6">Languages</h2>
				<div className="flex flex-wrap gap-4">
					{["English", "Hindi", "Kannada", "Urdu"].map((language, index) => (
						<span
							key={index}
							className="px-4 py-2 bg-blue-900 text-blue-200 rounded-full text-sm font-medium border border-blue-700"
						>
							{language}
						</span>
					))}
				</div>
			</div>
		</div>
	);
}
