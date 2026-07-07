import type { Config } from "tailwindcss";

/**
 * LEOR design tokens — luxury boutique identity.
 * Navy #0F2345 · Gold #D8B46A · Ivory #F8F6F2
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F2345",
          50: "#EEF1F6",
          100: "#D5DCE8",
          200: "#A9B8D0",
          300: "#7D93B7",
          400: "#51709F",
          500: "#2F4E7C",
          600: "#1D3760",
          700: "#0F2345",
          800: "#0A1930",
          900: "#060F1E",
        },
        gold: {
          DEFAULT: "#D8B46A",
          50: "#FBF7EE",
          100: "#F5EBD5",
          200: "#EBD7AB",
          300: "#E1C588",
          400: "#D8B46A",
          500: "#C89E48",
          600: "#A98232",
          700: "#856627",
          800: "#61491C",
          900: "#3D2E11",
        },
        ivory: "#F8F6F2",
        ink: "#2B2B2B",
        muted: "#6F6F6F",
        success: "#5E7B45",
        cream: "#FDFCFA",
        line: "#E9E4DA",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        arabic: ["var(--font-plex-arabic)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "12px",
        card: "12px",
        button: "12px",
      },
      boxShadow: {
        soft: "0 2px 16px rgba(15, 35, 69, 0.06)",
        card: "0 4px 24px rgba(15, 35, 69, 0.07)",
        lift: "0 12px 40px rgba(15, 35, 69, 0.12)",
        gold: "0 4px 20px rgba(216, 180, 106, 0.25)",
      },
      letterSpacing: {
        luxe: "0.18em",
        wider2: "0.12em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.6s ease both",
        shimmer: "shimmer 1.6s linear infinite",
      },
      maxWidth: {
        page: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
