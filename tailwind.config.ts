import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // GitHub dark-mode canvas
        bg: {
          DEFAULT: "#0d1117",
          soft: "#161b22",
          card: "#161b22",
          border: "#30363d",
          mute: "#21262d"
        },
        // GitHub blue (primary link / action)
        brand: {
          DEFAULT: "#58a6ff",
          soft: "#79c0ff",
          glow: "#1f6feb",
          ink: "#388bfd"
        },
        // GitHub green (the "Create / submit" action color)
        accent: {
          DEFAULT: "#3fb950",
          soft: "#7ee787",
          glow: "#238636",
          deep: "#0e4429"
        },
        // GitHub text scale
        ink: {
          DEFAULT: "#f0f6fc",
          mute: "#8b949e",
          dim: "#6e7681"
        },
        ok: {
          DEFAULT: "#3fb950",
          soft: "#7ee787",
          deep: "#238636"
        },
        warn: "#d29922",
        err: "#f85149"
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
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "monospace"
        ]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(88,166,255,0.35), 0 10px 40px -10px rgba(31,111,235,0.45)",
        "glow-green":
          "0 0 0 1px rgba(63,185,80,0.35), 0 10px 40px -10px rgba(35,134,54,0.5)"
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
