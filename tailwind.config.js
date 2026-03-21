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
          dark: '#404042',
          accent: '#f5c800',
          'accent-hover': '#e0b500',
        },
      },
      fontFamily: {
        sans: ['Barlow', 'sans-serif'],
        condensed: ['Barlow Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
