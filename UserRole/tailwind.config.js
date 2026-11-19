/** @type {import('tailwindcss').Config} */
export default {
   content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Jurnal / maqola sahifalari tokenlari
        ax: {
          ink: "#002147",
          firuza: "#127C82",
          "firuza-deep": "#0D5F64",
          "firuza-soft": "#E5F2F2",
          "firuza-light": "#6CC9CE",
          paper: "#F4F6F9",
          rule: "#DCE1E8",
          text: "#1A2433",
          muted: "#5A6475",
        },
      },
    },
  },
  plugins: [],
}

