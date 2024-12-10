/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#9966ff",
          dark: {
            DEFAULT: "#bb99ff",
          },
        },
      },
    },
  },
  plugins: [],
};
