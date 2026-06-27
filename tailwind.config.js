/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0284c7',
        secondary: '#e0f2fe',
        accent: '#f59e0b',
        background: '#f8fafc',
        surface: '#ffffff',
        'text-main': '#0f172a',
        'text-muted': '#64748b',
      },
    },
  },
  plugins: [],
}
