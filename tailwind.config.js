/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0faf0',
          100: '#dcf5dc',
          200: '#b8ecb8',
          300: '#86d986',
          400: '#4fbe4f',
          500: '#2da32d',
          600: '#1f8a1f',
          700: '#196b19',
          800: '#175417',
          900: '#134513',
          950: '#082608',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-md': '0 4px 12px rgba(0,0,0,0.08)',
        'brand':   '0 0 0 3px rgba(45,163,45,0.2)',
      },
    },
  },
  plugins: [],
}
