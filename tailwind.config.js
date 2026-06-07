// Developer: AKARSHANA
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan:    "#00FFFF",
        dark:    "#0A0A0F",
        card:    "#0F0F1A",
        surface: "#12121E",
        border:  "#1A1A2E",
      },
      fontFamily: {
        orbitron: ["'Orbitron'", "monospace"],
        rajdhani: ["'Rajdhani'", "sans-serif"],
        mono:     ["'Share Tech Mono'", "monospace"],
      },
      boxShadow: {
        "neon":    "0 0 30px rgba(0,255,255,0.5), 0 0 60px rgba(0,255,255,0.2)",
        "neon-sm": "0 0 15px rgba(0,255,255,0.3)",
        "neon-lg": "0 0 60px rgba(0,255,255,0.6), 0 0 120px rgba(0,255,255,0.2)",
      },
      backgroundImage: {
        "cyber-grid":
          "linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        // BUG FIX: key was "grid" which generated a Tailwind `bg-grid` utility
        // (background-size only) that shadowed the custom .bg-grid CSS component
        // (which sets the cyber-grid background-image). Renamed to "grid-pattern"
        // so the utility becomes `bg-grid-pattern` and doesn't conflict.
        "grid-pattern": "40px 40px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow":  "spin 3s linear infinite",
      },
    },
  },
  plugins: [],
};
