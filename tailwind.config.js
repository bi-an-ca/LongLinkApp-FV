/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          coral: 'var(--color-accent)',
          light: 'var(--color-background)',
          blush: 'var(--color-blush)',
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
