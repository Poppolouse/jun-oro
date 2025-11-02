/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#0a0e27',
        'neon-green': '#00ff88',
        'neon-purple': '#a855f7',
        'neon-pink': '#ff3366',
        'neon-cyan': '#00d9ff',
      },
      backdropBlur: {
        'md': '12px',
      }
    },
  },
  plugins: [],
}