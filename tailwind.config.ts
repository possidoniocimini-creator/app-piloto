import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#0b0d12",
          surface: "#14171f",
          surface2: "#1c202b",
          border: "#262b38",
        },
        brand: {
          DEFAULT: "#7c5cff",
          light: "#a58bff",
          dark: "#5b3ff0",
        },
        accent: {
          gold: "#e8b84b",
          success: "#3ecf8e",
          danger: "#ef4b5f",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
