/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ✅ Enables dark mode support via 'dark:' classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#5ece7b',
          DEFAULT: '#4CAF50',
          dark: '#3b8f3e',
        },
      },
    },
  },
  plugins: [],
}
