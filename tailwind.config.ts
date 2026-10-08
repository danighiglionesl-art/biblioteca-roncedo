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
          celeste: "#5B9BE5", // Celeste de las barras del escudo
          celesteDark: "#3E83D4",
          celesteLight: "#9BC5F5",
          celesteBg: "#BCE0FD", // Celeste del fondo del escudo
          celesteSoft: "#EAF3FD", // Leve celeste para cuadros y contenedores
          celesteMuted: "#F3F8FE", // Fondo de página suave
          navy: "#102A4E",
          navyDark: "#0B1D36",
          blue: "#5B9BE5",
          blueLight: "#8EC2F8",
          sky: "#DCEEFE",
          skyLight: "#F0F7FF",
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
