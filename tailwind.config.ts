import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        roncedo: {
          navy: "#102A4E",
          navyDark: "#0B1D36",
          blue: "#2D70C9",
          blueLight: "#6BA4E8",
          sky: "#E3EFFD",
          skyLight: "#F0F6FF",
          gold: "#C99A2C",
          goldLight: "#F5E9C9",
        },
      },
      fontFamily: {
        sans: ["Gotham", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        gotham: ["Gotham", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(16, 42, 78, 0.08)",
        carnet: "0 10px 30px -4px rgba(16, 42, 78, 0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
