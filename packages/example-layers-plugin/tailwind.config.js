
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "psBackground": "#4d4d4d",
        "psNeutral": "#535353",
        "psActive": "#6b6b6b",
        "psDark": "#454545",
        "psHover": "#516291"
      }
    },
  },
  plugins: [],
}