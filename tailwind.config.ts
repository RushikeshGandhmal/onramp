import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0b0b10",
          soft: "#11121a",
          card: "#15161f",
          border: "#23252f"
        },
        brand: {
          DEFAULT: "#7c5cff",
          soft: "#a18bff",
          glow: "#5b3eff"
        },
        ink: {
          DEFAULT: "#e7e8ee",
          mute: "#a2a4b1",
          dim: "#6b6e7c"
        },
        ok: "#3ecf8e",
        warn: "#ffb454",
        err: "#ff5e6c"
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Inter",
          "sans-serif"
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,92,255,0.35), 0 10px 40px -10px rgba(124,92,255,0.45)"
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out both",
        "slide-up": "slideUp 0.45s cubic-bezier(0.2,0.7,0.2,1) both",
        shimmer: "shimmer 1.6s linear infinite"
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" }
        }
      }
    }
  },
  plugins: []
};

export default config;
