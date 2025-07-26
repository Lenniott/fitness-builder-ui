/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "!./node_modules/**/*"
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#00F5A0',
        'brand-secondary': '#00D9E0',
        'dark-bg': '#111827',
        'dark-card': '#1F2937',
        'dark-border': '#374151',
        'light-text': '#F3F4F6',
        'medium-text': '#9CA3AF',
      }
    },
  },
  plugins: [],
} 