/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        obsidian: {
          50: "#f5f5f0", 100: "#e8e8e0", 200: "#d0d0c0", 300: "#a8a890",
          400: "#7a7a60", 500: "#555540", 600: "#3a3a2a", 700: "#252518",
          800: "#161610", 900: "#0a0a06", 950: "#050503",
        },
        amber: {
          50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d",
          400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309",
          800: "#92400e", 900: "#78350f",
        },
        cream: {
          50: "#fdfcf8", 100: "#faf8f0", 200: "#f4f0e4",
          300: "#ece4d0", 400: "#ddd0b4", 500: "#c8b898",
        },
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-up":       "fadeUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-up-blur":  "fadeUpBlur 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in":       "fadeIn 0.45s ease-out forwards",
        "scale-in":      "scaleIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "slide-right":   "slideRight 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer":       "shimmer 2.2s linear infinite",
        "float":         "float 6s ease-in-out infinite",
        "float-slow":    "float 9s ease-in-out 1.5s infinite",
        "float-slower":  "float 13s ease-in-out 3s infinite",
        "glow-pulse":    "glowPulse 3s ease-in-out infinite",
        "spin-slow":     "spinSlow 10s linear infinite",
        "spin-reverse":  "spinReverse 15s linear infinite",
        "draw-line":     "drawLine 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "border-glow":   "borderGlow 2.5s ease-in-out infinite",
        "count-pop":     "countPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "word-reveal":   "wordReveal 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "particle-a":    "particleA 9s ease-in-out infinite",
        "particle-b":    "particleB 12s ease-in-out 1.5s infinite",
        "particle-c":    "particleC 14s ease-in-out 3.5s infinite",
        "particle-d":    "particleD 8.5s ease-in-out 2s infinite",
        "particle-e":    "particleE 16s ease-in-out 0.8s infinite",
        "particle-f":    "particleF 11s ease-in-out 4s infinite",
        "morph":         "morph 8s ease-in-out infinite",
        "scanline":      "scanline 6s linear infinite",
        "ingredient-in": "ingredientIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(26px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeUpBlur: {
          "0%":   { opacity: "0", transform: "translateY(36px)", filter: "blur(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)",    filter: "blur(0px)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.86)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideRight: {
          "0%":   { opacity: "0", transform: "translateX(-32px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-1200px 0" },
          "100%": { backgroundPosition: "1200px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%":      { transform: "translateY(-12px) rotate(0.8deg)" },
          "66%":      { transform: "translateY(-5px) rotate(-0.8deg)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.25", transform: "scale(1)" },
          "50%":      { opacity: "0.75", transform: "scale(1.06)" },
        },
        spinSlow: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        spinReverse: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
        drawLine: {
          "0%":   { transform: "scaleX(0)", transformOrigin: "left" },
          "100%": { transform: "scaleX(1)", transformOrigin: "left" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(251,191,36,0.10)" },
          "50%":      { borderColor: "rgba(251,191,36,0.40)" },
        },
        countPop: {
          "0%":   { transform: "scale(0) translateY(8px)", opacity: "0" },
          "65%":  { transform: "scale(1.12) translateY(-2px)", opacity: "1" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        wordReveal: {
          "0%":   { opacity: "0", transform: "translateY(110%) skewY(4deg)" },
          "100%": { opacity: "1", transform: "translateY(0) skewY(0deg)" },
        },
        particleA: {
          "0%, 100%": { transform: "translate(0,0) scale(1)",         opacity: "0.18" },
          "25%":      { transform: "translate(45px,-35px) scale(1.3)",opacity: "0.5"  },
          "50%":      { transform: "translate(22px,-65px) scale(0.8)", opacity: "0.25" },
          "75%":      { transform: "translate(-22px,-32px) scale(1.1)",opacity: "0.38" },
        },
        particleB: {
          "0%, 100%": { transform: "translate(0,0)",           opacity: "0.12" },
          "33%":      { transform: "translate(-55px, 22px)",   opacity: "0.42" },
          "66%":      { transform: "translate(35px, 45px)",    opacity: "0.22" },
        },
        particleC: {
          "0%, 100%": { transform: "translate(0,0) rotate(0deg)",   opacity: "0.08"  },
          "50%":      { transform: "translate(65px,-45px) rotate(180deg)", opacity: "0.38" },
        },
        particleD: {
          "0%, 100%": { transform: "translate(0,0)",           opacity: "0.22" },
          "40%":      { transform: "translate(-32px,-55px)",   opacity: "0.48" },
          "80%":      { transform: "translate(22px,-22px)",    opacity: "0.12" },
        },
        particleE: {
          "0%, 100%": { transform: "translate(0,0) scale(1)",       opacity: "0.18" },
          "20%":      { transform: "translate(28px, 40px) scale(1.4)", opacity: "0.4"  },
          "60%":      { transform: "translate(-45px,12px) scale(0.7)", opacity: "0.28" },
        },
        particleF: {
          "0%, 100%": { transform: "translate(0,0)",           opacity: "0.15" },
          "50%":      { transform: "translate(-20px,-70px)",   opacity: "0.45" },
        },
        morph: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "25%":      { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "50%":      { borderRadius: "50% 60% 30% 60% / 40% 70% 60% 30%" },
          "75%":      { borderRadius: "40% 60% 60% 40% / 60% 40% 40% 60%" },
        },
        scanline: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        ingredientIn: {
          "0%":   { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
