/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        glass: {
          white:  'rgba(255,255,255,0.08)',
          border: 'rgba(255,255,255,0.14)',
          hover:  'rgba(255,255,255,0.14)',
          dark:   'rgba(0,0,0,0.25)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      boxShadow: {
        glass:      '0 8px 32px 0 rgba(0,0,0,0.37)',
        'glass-sm': '0 4px 16px 0 rgba(0,0,0,0.2)',
        'glass-lg': '0 16px 48px 0 rgba(0,0,0,0.5)',
        'glass-xl': '0 24px 64px 0 rgba(0,0,0,0.6)',
        glow:       '0 0 40px rgba(249,115,22,0.35)',
        'glow-sm':  '0 0 20px rgba(249,115,22,0.25)',
        'glow-lg':  '0 0 60px rgba(249,115,22,0.45)',
        'glow-warm':'0 0 80px rgba(249,115,22,0.2)',
        inner:      'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      animation: {
        'fade-in':        'fadeIn 0.5s ease forwards',
        'slide-up':       'slideUp 0.6s ease forwards',
        'pulse-slow':     'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'pulse-slower':   'pulse 7s cubic-bezier(0.4,0,0.6,1) infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'float':          'float 7s ease-in-out infinite',
        'float-delayed':  'float 9s ease-in-out 2s infinite',
        'drift':          'drift 20s ease-in-out infinite',
        'drift-slow':     'drift 30s ease-in-out infinite',
        'shimmer':        'shimmer 1.6s infinite',
        'glow-pulse':     'glowPulse 3s ease-in-out infinite',
        'rise':           'rise 1s cubic-bezier(0.22,1,0.36,1) forwards',
        'spin-slow':      'spin 20s linear infinite',
        'breathe':        'breathe 4s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
        'count-up':       'countUp 2s cubic-bezier(0.22,1,0.36,1) forwards',
        'border-glow':    'borderGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        gradientShift: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':     { transform: 'translateY(-14px) rotate(2deg)' },
          '66%':     { transform: 'translateY(-8px) rotate(-1deg)' },
        },
        drift: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '25%':     { transform: 'translate(3%,4%) scale(1.03)' },
          '50%':     { transform: 'translate(-2%,6%) scale(0.97)' },
          '75%':     { transform: 'translate(4%,-2%) scale(1.02)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 20px rgba(249,115,22,0.2)' },
          '50%':     { boxShadow: '0 0 50px rgba(249,115,22,0.5)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(40px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        breathe: {
          '0%,100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%':     { transform: 'scale(1.08)', opacity: '1' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        borderGlow: {
          '0%,100%': { borderColor: 'rgba(249,115,22,0.25)' },
          '50%':     { borderColor: 'rgba(249,115,22,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
