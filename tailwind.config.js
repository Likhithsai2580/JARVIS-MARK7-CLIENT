module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
      },
      colors: {
        'jarvis-blue': '#00a8ff',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px #00a8ff' },
          '50%': { boxShadow: '0 0 40px #00a8ff' },
        }
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, #00a8ff1a 1px, transparent 1px), linear-gradient(to bottom, #00a8ff1a 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-pattern': '20px 20px',
      },
    },
  },
  plugins: [],
} 