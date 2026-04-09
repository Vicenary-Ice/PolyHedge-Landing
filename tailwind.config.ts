import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        card: "#111111",
        border: "#1E1E1E",
        accent: "#00FF94",
        secondary: "#888888",
        muted: "#444444",
      },
    },
  },
  plugins: [],
};

export default config;
