/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        background: {
          DEFAULT: "#0a0a0f",
          secondary: "#111118",
          tertiary: "#1a1a24",
        },
        surface: {
          DEFAULT: "#16161f",
          hover: "#1e1e2a",
          active: "#252532",
        },
        border: {
          DEFAULT: "#2a2a3a",
          light: "#3a3a4a",
        },
        accent: {
          amber: "#f59e0b",
          orange: "#ef4444",
          gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
        },
        text: {
          primary: "#ffffff",
          secondary: "#a1a1aa",
          muted: "#71717a",
        },
        platform: {
          bilibili: "#00A1D6",
          weibo: "#E6162D",
          zhihu: "#0084FF",
          github: "#24292F",
          juejin: "#1E80FF",
          douyin: "#000000",
          "36kr": "#0080FF",
          ithome: "#D32F2F",
          segmentfault: "#009A61",
          oschina: "#009688",
          infoq: "#007DC5",
          ruanyifeng: "#E91E63",
          csdn: "#FC5531",
          stcn: "#C62828",
          caixin: "#8B0000",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
          "PingFang SC",
          "Microsoft YaHei",
        ],
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
          "PingFang SC",
          "Microsoft YaHei",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(245, 158, 11, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(245, 158, 11, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "shimmer-gradient": "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
      },
    },
  },
  plugins: [],
};
