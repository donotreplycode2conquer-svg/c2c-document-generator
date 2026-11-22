/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#d9e2ee',
          200: '#b4c6de',
          300: '#8ba6cb',
          400: '#5a82b3',
          500: '#386399',
          600: '#284e7d',
          700: '#1e3c63',
          800: '#172f4e',
          900: '#0a192f',
          950: '#060f1e'
        },
        gold: {
          50: '#fdfbf2',
          100: '#fbf5df',
          200: '#f5e7b5',
          300: '#eed386',
          400: '#e5bc54',
          500: '#d4af37',
          600: '#b89025',
          700: '#946f1e',
          800: '#79581e',
          900: '#674a1e',
          950: '#3c280d'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        mono: ['Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
