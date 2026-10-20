/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,json}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono Variable', 'JetBrains Mono', 'monospace'],
      },
      maxWidth: {
        frame: '1280px',
      },
    },
  },
  plugins: [],
};
