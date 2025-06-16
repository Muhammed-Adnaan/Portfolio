import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import Resume from "./components/Resume";
import About from "./components/About";

function App() {
	return (
		<div>
			<Router>
				<Nav />
				<Routes>
					<Route path="/" element={<Hero />} />
					<Route path="/resume" element={<Resume />} />
					<Route path="/about" element={<About />} />
				</Routes>
			</Router>
			{/* <Hero/> */}
		</div>
	);
}

export default App;
