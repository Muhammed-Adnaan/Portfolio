import { Suspense, lazy, useLayoutEffect, useRef } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	useLocation,
} from "react-router-dom";
import { gsap, STEPS, prefersReducedMotion } from "./lib/retro";
import Hero from "./components/Hero";
import SecretHub from "./components/SecretHub";
import Nav from "./components/Nav";

// Hero and Nav ship in the initial bundle; everything else is fetched on demand
// so the landing page doesn't pay for the project galleries.
const Resume = lazy(() => import("./components/Resume"));
const About = lazy(() => import("./components/About"));
const Project = lazy(() => import("./components/Proj"));
const Skills = lazy(() => import("./components/Skills"));
const Contact = lazy(() => import("./components/Contact"));
const AduitCodeProject = lazy(() => import("./components/projects/AduitCodeProject"));
const MedicareProject = lazy(() => import("./components/projects/MedicareProject"));
const QuillProject = lazy(() => import("./components/projects/QuillProject"));
const TravelBlogProject = lazy(() => import("./components/projects/TravelBlogProject"));

function PageFallback() {
	return (
		<div className="pixelify-sans bg-[#00234b] min-h-screen min-h-[100svh] w-full flex items-center justify-center">
			<span className="text-yellow-400 text-2xl animate-fade-in-late">
				Loading…
			</span>
		</div>
	);
}

function NotFound() {
	return (
		<div className="pixelify-sans bg-[#00234b] min-h-screen w-full flex flex-col items-center justify-center gap-6 p-8 text-center">
			<h1 className="text-yellow-400 text-6xl md:text-8xl font-bold">404</h1>
			<p className="text-white text-xl md:text-2xl">
				This page doesn't exist.
			</p>
			<Link
				to="/"
				className="px-6 py-3 bg-yellow-400 text-[#00234b] rounded-lg font-bold hover:bg-yellow-300 transition-colors duration-300"
			>
				Back to Home
			</Link>
		</div>
	);
}

/**
 * Screen-change step and scroll reset, so a new page never opens halfway down.
 *
 * This deliberately animates transform only. Fading the wrapper meant the
 * whole page dropped to zero opacity on every navigation, which read as a
 * full-screen flash — nothing was painted behind it but the document ground.
 * Each page already steps its own content in, so the entrance is covered;
 * here the page only needs to arrive, never to disappear first.
 */
function RouteTransition({ children }) {
	const scope = useRef(null);
	const { pathname } = useLocation();

	useLayoutEffect(() => {
		window.scrollTo(0, 0);
		if (!scope.current || prefersReducedMotion()) {
			return undefined;
		}
		const ctx = gsap.context(() => {
			gsap.fromTo(
				scope.current,
				{ y: 8 },
				{
					y: 0,
					duration: 0.26,
					ease: STEPS.quick,
					snap: { y: 1 },
					clearProps: "transform",
				}
			);
		}, scope);
		return () => ctx.revert();
	}, [pathname]);

	return <div ref={scope}>{children}</div>;
}

function App() {
	return (
		<div>
			<Router>
				<Nav />
				<RouteTransition>
					<Suspense fallback={<PageFallback />}>
						<Routes>
							<Route path="/" element={<Hero />} />
							<Route path="/resume" element={<Resume />} />
							<Route path="/about" element={<About />} />
							<Route path="/projects" element={<Project />} />
							<Route path="/skills" element={<Skills />} />
							<Route path="/contact" element={<Contact />} />
							<Route path="/projects/aduitcode" element={<AduitCodeProject />} />
							<Route path="/projects/medicare" element={<MedicareProject />} />
							<Route path="/projects/quill" element={<QuillProject />} />
							<Route path="/projects/travelblog" element={<TravelBlogProject />} />
							<Route path="*" element={<NotFound />} />
						</Routes>
					</Suspense>
				</RouteTransition>
				<SecretHub />
			</Router>
		</div>
	);
}

export default App;
