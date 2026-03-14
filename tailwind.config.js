/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
            },
            colors: {
                // adding a custom ultra-dark zinc/slate
                darkBase: '#09090b',
                glass: 'rgba(255, 255, 255, 0.05)',
                glassBorder: 'rgba(255, 255, 255, 0.1)',
            }
        },
    },
    plugins: [],
}
