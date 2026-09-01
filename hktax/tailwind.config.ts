import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef5fb",
          100: "#d9e8f3",
          600: "#27557a",
          700: "#1f4566",
          800: "#16324f",
          900: "#0e2038",
          950: "#071426"
        },
        teal: {
          50: "#eefafa",
          100: "#d2f0ee",
          400: "#65c3bd",
          500: "#3ba19d",
          600: "#2b8a8a",
          700: "#23706f"
        },
        gold: {
          DEFAULT: "#d4a94e",
          100: "#f8edcf",
          200: "#efd58d",
          600: "#b3862b",
          700: "#8b681f"
        },
        warm: {
          50: "#f7f5f0",
          100: "#eeebe3",
          150: "#e8e3d8",
          200: "#ddd7c9",
          500: "#8b8375",
          600: "#6f675c",
          700: "#554e45",
          900: "#292520"
        }
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "\"Noto Sans TC\"",
          "\"PingFang TC\"",
          "\"Microsoft JhengHei\"",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      },
      fontSize: {
        "display-2xl": ["5rem", { lineHeight: "1.04", fontWeight: "800" }],
        "display-xl": ["4rem", { lineHeight: "1.05", fontWeight: "800" }],
        "display-lg": ["3.25rem", { lineHeight: "1.07", fontWeight: "800" }],
        "display-md": ["2.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        "display-sm": ["2rem", { lineHeight: "1.14", fontWeight: "700" }]
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        settleIn: {
          "0%": { opacity: "0", transform: "scale(.985)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      },
      animation: {
        "rise-in": "riseIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "settle-in": "settleIn 350ms cubic-bezier(0.16, 1, 0.3, 1) both"
      },
      boxShadow: {
        soft: "0 18px 45px -28px rgb(14 32 56 / 0.45)",
        lift: "0 22px 54px -32px rgb(14 32 56 / 0.5), 0 8px 18px -14px rgb(14 32 56 / 0.2)",
        card: "0 1px 1px rgb(14 32 56 / 0.03), 0 18px 48px -34px rgb(14 32 56 / 0.42)",
        "card-hover": "0 1px 1px rgb(14 32 56 / 0.04), 0 26px 64px -34px rgb(14 32 56 / 0.5), 0 10px 22px -18px rgb(43 138 138 / 0.32)",
        button: "inset 0 1px 0 rgb(255 255 255 / 0.38), 0 12px 24px -16px rgb(7 20 38 / 0.52)",
        "button-hover": "inset 0 1px 0 rgb(255 255 255 / 0.48), 0 16px 30px -18px rgb(7 20 38 / 0.58)",
        field: "inset 0 1px 0 rgb(255 255 255 / 0.82), 0 1px 2px rgb(14 32 56 / 0.05)"
      }
    }
  },
  plugins: []
};

export default config;
