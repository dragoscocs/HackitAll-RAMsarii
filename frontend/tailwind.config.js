/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366f1',
          dark:    '#4f46e5',
          light:   '#818cf8',
        },
        surface: {
          DEFAULT: '#0f172a',
          card:    '#1e293b',
          border:  '#334155',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        skeleton:   'var(--skeleton)',
        input:      'var(--input)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      boxShadow: {
        input: [
          '0px 2px 3px -1px rgba(0,0,0,0.1)',
          '0px 1px 0px 0px rgba(25,28,33,0.02)',
          '0px 0px 0px 1px rgba(25,28,33,0.08)',
        ].join(', '),
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.35s ease-out',
        ripple:       'ripple 2s ease calc(var(--i, 0) * 0.2s) infinite',
        orbit:        'orbit calc(var(--duration) * 1s) linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ripple: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
          '50%':      { transform: 'translate(-50%, -50%) scale(0.9)' },
        },
        orbit: {
          '0%':   { transform: 'rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
}
