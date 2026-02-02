import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stockyard-style colors
        primary: {
          DEFAULT: "#183521", // Stockyard dark green
          50: "#e8f5ed",
          100: "#d1ebdb",
          200: "#a3d7b7",
          300: "#75c393",
          400: "#47af6f",
          500: "#2d8b50",
          600: "#246e40",
          700: "#1b5130",
          800: "#183521", // Main background
          900: "#0f2316",
          950: "#081209",
        },
        accent: {
          DEFAULT: "#E1C825", // Stockyard gold
          50: "#fefce8",
          100: "#fdf8c4",
          200: "#fcf08c",
          300: "#f9e44a",
          400: "#E1C825", // Main gold accent
          500: "#c9b120",
          600: "#a08c1a",
          700: "#786814",
          800: "#50440d",
          900: "#282207",
          950: "#141104",
        },
        // Card backgrounds (Stockyard gray)
        card: {
          DEFAULT: "#D9D8D8",
          light: "#e8e8e8",
          dark: "#c0bfbf",
        },
        // Selected/active state (tan/beige)
        selected: {
          DEFAULT: "#d4c9a8",
          light: "#e8e0c8",
          dark: "#c4b590",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
