/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        dark:   '#0d0d14',
        rose:   '#ff5e7d',
        orange: '#ffa73c',
        yellow: '#ffd43b',
        green:  '#33d17a',
        blue:   '#2da5ff',
        purple: '#9b5dff',
      },
    },
  },
  plugins: [],
};
