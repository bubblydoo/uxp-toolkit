import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    __dirname + "/index.html",
    __dirname + "/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}