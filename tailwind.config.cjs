/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/popup/index.html",
    "./components/popup/src/**/*.{js,ts,jsx,tsx}",
    "./components/content/index.html",
    "./components/content/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
