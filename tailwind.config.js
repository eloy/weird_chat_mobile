/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./components/*.js", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
