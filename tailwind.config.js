
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#0ea765', // green accent
          50: '#effaf5',
          100: '#dcf7ea',
          200: '#b3eccf',
          300: '#86e0b3',
          400: '#4bcf8c',
          500: '#0ea765',
          600: '#0b8a54',
          700: '#096c43',
          800: '#074f32',
          900: '#053f29'
        }
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
