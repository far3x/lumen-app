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
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
      },
      fontSize: {
        '7xl': '5rem',
        '8xl': '6rem',
      }
    },
  },
  plugins: [],
}