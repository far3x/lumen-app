/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'white': '#FFFFFF',
        'background': '#FDFCFB',
        'surface': '#FFFFFF',
        'dark-surface': '#252A2E',

        'app-bg': '#E5E7EB',
        'app-surface': '#FFFFFF',
        'app-border': '#D1D5DB',
        'app-text-primary': '#1A202C',
        'app-text-secondary': '#5A6474',
        'app-text-tertiary': '#8C96A5',
        'app-accent-hover': '#F3F4F6',

        'text': {
          'headings': '#1E2022',
          'body': '#404346',
          'muted': '#737678',
        },
        'border': '#F0EEED',
        'accent-purple': '#8A2BE2',
        'accent-pink': '#FF69B4',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(to right, #8A2BE2, #FF69B4)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'draw-chart': {
          '0%': { 'stroke-dashoffset': '1000' },
          '100%': { 'stroke-dashoffset': '0' },
        },
        'grow-bar': {
            '0%': { transform: 'scaleY(0)' },
            '100%': { transform: 'scaleY(1)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'draw-chart': 'draw-chart 2s ease-out forwards',
        'grow-bar': 'grow-bar 1s ease-out forwards',
      },
       fontSize: {
        '7xl': '5rem',
        '8xl': '6rem',
      }
    },
  },
  plugins: [],
}