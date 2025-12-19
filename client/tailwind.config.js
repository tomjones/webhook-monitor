/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#8b0a39',
          50: '#fdf2f5',
          100: '#fce7ed',
          200: '#f9d0dc',
          300: '#f4a8bf',
          400: '#ec7499',
          500: '#e04876',
          600: '#cc285d',
          700: '#b01a4a',
          800: '#8b0a39',
          900: '#7a0832',
          950: '#4a041d',
        },
      },
    },
  },
  plugins: [],
}
