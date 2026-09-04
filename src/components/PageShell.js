/**
 * Shared page container. The top padding clears the fixed Nav, which would
 * otherwise sit on top of each page's heading on small screens.
 *
 * Takes a `ref` (React 19 passes it as a plain prop) so pages can scope their
 * GSAP context to the whole shell.
 */
export default function PageShell({ children, className = "", ref }) {
	return (
		<div
			ref={ref}
			className={`pixelify-sans bg-[#00234b] min-h-screen min-h-[100svh] w-full font-inter px-5 pt-24 pb-16 sm:px-8 md:px-[100px] md:pt-[110px] md:pb-[100px] ${className}`}
		>
			{children}
		</div>
	);
}
