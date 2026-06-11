/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: { primary:'#0d1117', secondary:'#161b22', card:'#1c2333', hover:'#212d40' },
        border: { DEFAULT:'#2d3748', light:'#374151' },
        accent: { DEFAULT:'#22c55e', dark:'#16a34a' },
      },
    },
  },
  plugins: [],
}
