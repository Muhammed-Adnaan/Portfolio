/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
	theme: {
		extend: {
			keyframes: {
				blink: {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0" },
				},
				"fade-in": {
					from: { opacity: "0" },
					to: { opacity: "1" },
				},
			},
			animation: {
				blink: "blink 1s step-end infinite",
				// Held back so a fast chunk load never flashes the text.
				"fade-in-late": "fade-in 200ms ease-out 400ms both",
			},
		},
	},
	plugins: [],
};
