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
        // Vibe-Coded Baseball brand colors
        primary: {
          DEFAULT: "#183521", // Dark green
          50: "#f0f5f1",
          100: "#d9e5dc",
          200: "#b3cbb9",
          300: "#8db196",
          400: "#679773",
          500: "#417d50",
          600: "#346440",
          700: "#274b30",
          800: "#1a3220",
          900: "#183521", // Main brand color
          950: "#0d1a11",
        },
        accent: {
          DEFAULT: "#E1C825", // Gold
          50: "#fdfce8",
          100: "#fbf8c4",
          200: "#f7ef8c",
          300: "#f3e24a",
          400: "#e9d11d",
          500: "#E1C825", // Main accent color
          600: "#c19b10",
          700: "#9a7111",
          800: "#7f5916",
          900: "#6c4918",
          950: "#3f270a",
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
