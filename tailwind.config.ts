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
        serif: ["var(--font-serif)", "Georgia", "Cambria", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        accent: {
          DEFAULT: "#1e3a8a",
          50: "#eff3fb",
          100: "#dbe4f5",
          600: "#1e3a8a",
          700: "#16295e",
        },
        // Deep navy-black — hero band background + primary display text.
        ink: {
          DEFAULT: "#0e1b33",
          800: "#132340",
        },
        // Warm off-white "document" surface + its hairline edge. Reinforces the
        // paper/filing-house world without tipping into the cream-template look.
        paper: {
          DEFAULT: "#fbfaf7",
          edge: "#e9e4d8",
        },
        // Muted brass — official-seal / notary-stamp accent. Used only on the
        // fax-receipt "TRANSMISSION OK" stamp and a hairline top rule.
        seal: "#b08d4f",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
