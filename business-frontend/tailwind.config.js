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
        'background': '#F9FAFB',
        'surface': '#FFFFFF',
        'dark-surface': '#252A2E',
        
        'app-bg': '#E5E7EB',
        'app-surface': '#FFFFFF',
        'app-border': '#D1D5DB',
        'app-accent-hover': '#F3F4F6',

        'text-headings': '#111827',
        'text-body': '#374151',
        'text-muted': '#6B7280',
        'text-tertiary': '#9CA3AF',
        
        'primary': '#4f46e5',
        
        'accent-purple': '#8A2BE2',
        'accent-pink': '#FF69B4',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(to right, #4f46e5, #7c3aed)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'grow-bar': {
            '0%': { transform: 'scaleY(0)' },
            '100%': { transform: 'scaleY(1)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'fade-in': 'fade-in 0.2s ease-out forwards',
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