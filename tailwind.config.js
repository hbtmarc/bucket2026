/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b0d10",
          900: "#111318",
          800: "#1a1f27",
          700: "#262d38",
          600: "#354155",
          500: "#4b5a72",
        },
        brand: {
          50: "#eef7ff",
          100: "#d9ecff",
          200: "#b4d9ff",
          300: "#82bfff",
          400: "#4b9bff",
          500: "#2b7dff",
          600: "#1f60f2",
          700: "#1a4ad0",
          800: "#1b3fa8",
          900: "#1c357f",
        },
      },
      boxShadow: {
        card: "0 10px 30px -18px rgba(15, 23, 42, 0.45)",
      },
    },
  },
  plugins: [],
};
