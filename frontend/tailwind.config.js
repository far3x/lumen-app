/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#0D0D12',
        'surface': '#13131A',
        'primary': '#1D1D26',
        'abyss-dark': '#08080A',
        'subtle': '#3F3F4D',
        'text-main': '#E5E5E5',
        'text-secondary': '#A3A3B2',
        'accent-purple': '#8A2BE2',
        'accent-pink': '#FF69B4',
        'accent-cyan': '#00D9D9',
      },
      fontFamily: {
        sans: ['Satoshi', 'sans-serif'],
      },
      backgroundImage: {
        'aurora': 'radial-gradient(ellipse 80% 50% at 50% -20%,rgba(138,43,226,0.3), transparent)',
        'hero-gradient': 'linear-gradient(90deg, #8A2BE2 0%, #FF69B4 50%, #00D9D9 100%)',
        'grid-pattern': `
          linear-gradient(rgba(138, 43, 226, 0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(138, 43, 226, 0.15) 1px, transparent 1px)
        `,
        'starfield-pattern': 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0.5px, transparent 0)',
        'docs-gradient': 'radial-gradient(ellipse at top, #1D1D26 0%, #08080A 80%)',
      },
      backgroundSize: {
        'grid-size': '40px 40px',
        'starfield-size': '30px 30px',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-pan': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'grid-pan': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '40px 40px' },
        },
        'pulse-right': {
          '0%': { backgroundPosition: '-200% center, 0% center' },
          '40%': { backgroundPosition: '200% center, 0% center' },
          '100%': { backgroundPosition: '200% center, 0% center' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'gradient-pan': 'gradient-pan 3s ease infinite',
        'grid-pan': 'grid-pan 1.5s linear infinite',
        'pulse-right': 'pulse-right 5s ease-in infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}