/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#111827',
          card: 'rgba(31, 41, 55, 0.5)',
          border: 'rgba(55, 65, 81, 1)',
          text: '#f9fafb',
          'text-secondary': '#9ca3af',
          input: '#1f2937'
        },
        light: {
          bg: '#f3f4f6',
          card: '#ffffff',
          border: '#e5e7eb',
          text: '#111827',
          'text-secondary': '#6b7280',
          input: '#f9fafb'
        },
        'accent-cyan': '#22d3ee',
        'accent-purple': '#a78bfa',
        'accent-pink': '#f472b6',
        'status-green': '#34d399',
        'status-yellow': '#facc15',
        'status-red': '#f87171',
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(90deg, #22d3ee 0%, #a78bfa 50%, #f472b6 100%)',
        'button-gradient': 'linear-gradient(90deg, #22d3ee 0%, #a78bfa 100%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(34, 211, 238, 0.3)',
      }
    },
  },
  plugins: [],
}