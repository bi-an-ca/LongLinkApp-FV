/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          coral: '#F7838D',
          light: '#FFECF2',
          blush: '#FAC2C6',
        },
      },
      fontFamily: {
        'tan-nimbus': ['Tan Nimbus', 'sans-serif'],
        'arimo': ['ARIMO', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
