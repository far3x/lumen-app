/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#f0f0f0',
        'surface': '#EBEBEB',
        'primary': '#DFDFDF',
        'subtle': '#d1d5db',
        'text-main': '#1f2937',
        'text-secondary': '#4b5563',
        'accent-primary': '#DC2626',
        'accent-purple': '#8A2BE2',
        'accent-pink': '#FF69B4',
        'accent-cyan': '#00D9D9',
        'dark-background': '#0D0D12',
        'dark-surface': '#13131A',
        'dark-primary': '#1D1D26',
        'dark-subtle': '#3F3F4D',
      },
      fontFamily: {
        sans: ['Satoshi', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(90deg, #8A2BE2 0%, #FF69B4 50%, #00D9D9 100%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
      scale: {
        '101': '1.01',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}