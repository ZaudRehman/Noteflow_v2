/** @type {import('tailwindcss').Config} */

const typography = require('@tailwindcss/typography');

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx}",
    "./src/context/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class", // class-based dark mode
  theme: {
    extend: {
      colors: {
        parchmentLight: "#f7f3ed",
        whiteSmoke: "#f5f5f7",
        charcoal: "#334155",
        charcoalFog: "#cbd5e1",
        indigoPulse: "#6366f1",
        pinkPastel: "#f9a8d4",
        mintPastel: "#a3ffd6",
        neonCoral: "#ff6b6b",
        snow: "#f9fafb",
        graphiteCloud: "#1f2937",
        snowDrift: "#e5e7eb",
      },
      fontFamily: {
        inter: ['var(--font-inter)'],
        robotoslab: ['var(--font-roboto-slab)'],
      },
      boxShadow: {
        neu:
          "8px 8px 15px rgba(0, 0, 0, 0.1), -8px -8px 15px rgba(255, 255, 255, 0.8)",
        neuInner:
          "inset 8px 8px 15px rgba(0, 0, 0, 0.1), inset -8px -8px 15px rgba(255, 255, 255, 0.8)",
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [typography],
};
