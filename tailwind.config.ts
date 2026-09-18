import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#100b08",
          surface: "#1c130d",
          surface2: "#271b12",
          border: "#3a2a1a",
        },
        brand: {
          DEFAULT: "#f5871f",
          light: "#ffab5c",
          dark: "#c2540c",
        },
        accent: {
          gold: "#ffcf5c",
          ember: "#ff4d2e",
          success: "#3ecf8e",
          danger: "#ef4b5f",
        },
      },
      backgroundImage: {
        flame: "linear-gradient(135deg, #ff4d2e 0%, #f5871f 55%, #ffcf5c 100%)",
        "flame-radial":
          "radial-gradient(circle at 50% 0%, rgba(245,135,31,0.16), transparent 60%)",
      },
      boxShadow: {
        flame: "0 0 24px -4px rgba(245,135,31,0.55)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
