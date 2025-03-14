/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", 
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#c7d2fe",
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
        },
        secondary: {
          light: "#bfdbfe",
          DEFAULT: "#3b82f6",
          dark: "#2563eb",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-8px)" },
          "40%, 80%": { transform: "translateX(8px)" },
        },
      },
      boxShadow: {
        'inner-xl': 'inset 0 4px 6px rgba(0, 0, 0, 0.1)',
        'soft': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
}
