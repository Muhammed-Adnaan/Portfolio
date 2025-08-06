import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import Resume from "./components/Resume";
import About from "./components/About";
import Project from "./components/Proj";
import Skills from "./components/Skills";
import AduitCodeProject from "./components/projects/AduitCodeProject";
import MedicareProject from "./components/projects/MedicareProject";
import QuillProject from "./components/projects/QuillProject";
import TravelBlogProject from "./components/projects/TravelBlogProject";

function App() {
	return (
		<div>
			<Router>
				<Nav />
				<Routes>
					<Route path="/" element={<Hero />} />
					<Route path="/resume" element={<Resume />} />
					<Route path="/about" element={<About />} />
					<Route path="/projects" element={<Project />} />
					<Route path="/skills" element={<Skills />} />
					<Route path="/projects/aduitcode" element={<AduitCodeProject />} />
					<Route path="/projects/medicare" element={<MedicareProject />} />
					<Route path="/projects/quill" element={<QuillProject />} />
					<Route path="/projects/travelblog" element={<TravelBlogProject />} />
				</Routes>
			</Router>
		</div>
	);
}

export default App;
