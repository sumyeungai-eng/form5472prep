import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        accent: {
          DEFAULT: "#1e3a8a",
          50: "#eff3fb",
          600: "#1e3a8a",
          700: "#172e6b",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
