import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          start: '#e8f7fa',
          middle: '#e2f5f8',
          end: '#d8f3f7'
        },
        primary: {
          50: "#f0f6fe",
          100: "#dceafe",
          200: "#bdd5fe",
          300: "#8ebafc",
          400: "#5896f7",
          500: "#1877f2",   
          600: "#0c5dd4",
          700: "#0d4eab",
          800: "#11438c",
          900: "#153a73"
        },
        dark: {
          // Facebook dark mode colors
          bg: '#18191a',         // Main background
          card: '#242526',       // Card/Container background
          hover: '#3a3b3c',      // Hover state
          active: '#4e4f50',     // Active/Selected state
          border: '#3a3b3c',     // Borders
          text: {
            primary: '#e4e6eb',  // Primary text
            secondary: '#b0b3b8' // Secondary text
          },
          button: {
            primary: '#263951',  // Primary button bg
            hover: '#2d4260'     // Primary button hover
          }
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
