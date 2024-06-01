module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'media',
  theme: {
    extend: {
      height: {
        '60vh': '60vh',
        '70vh': '70vh',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
