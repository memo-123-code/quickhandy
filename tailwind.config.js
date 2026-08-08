/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            50: "#f0f7ff",
            100: "#e0effe",
            200: "#bae0fd",
            300: "#7cc8fb",
            400: "#38acf7",
            500: "#0e91e9",
            600: "#0273c7",
            700: "#035ca2",
            800: "#074f85",
            900: "#0c426e",
            950: "#082a4a", // Deep trust blue
          },
          orange: {
            50: "#fff7ed",
            100: "#ffedd5",
            200: "#fed7aa",
            300: "#fdba74",
            400: "#fb923c",
            500: "#f97316", // Safety Orange
            600: "#ea580c",
            700: "#c2410c",
            850: "#9a3412",
            900: "#7c2d12",
          },
          gold: {
            50: "#fefdf2",
            100: "#fefacd",
            200: "#fdf59a",
            300: "#fbe95a",
            400: "#f7d725",
            500: "#eab308", // Gold accent
            600: "#ca8a04",
            700: "#a16207",
          }
        },
        dark: {
          bg: "#0b0f19",
          card: "#151d30",
          border: "#1f2c47",
          text: "#f8fafc",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      }
    },
  },
  plugins: [],
};
