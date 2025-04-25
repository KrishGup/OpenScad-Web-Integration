/** @type {import('tailwindcss').Config} */
import preset from './tailwind-preset.js';

export default {
  presets: [preset],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}