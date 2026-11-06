/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FCFBF7',
          100: '#FAF9F5',
          200: '#F4F2EA',
          300: '#E9E6D8',
          400: '#DDD9C5',
          500: '#CCC6AD',
        },
        forest: {
          50: '#E8F5F1',
          100: '#C5E7DE',
          200: '#91D2C1',
          300: '#54B79E',
          400: '#2A977D',
          500: '#165B47',
          600: '#0F4C3A',
          700: '#0B3B2C',
          800: '#082D22',
          900: '#051E17',
        },
        action: {
          light: '#FF8A33',
          DEFAULT: '#FF6B00',
          hover: '#E65D00',
          dark: '#CC5000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        card: '0 4px 20px -2px rgba(15, 76, 58, 0.05)',
        elevated: '0 10px 25px -5px rgba(15, 76, 58, 0.08), 0 8px 10px -6px rgba(15, 76, 58, 0.04)',
      },
    },
  },
  plugins: [],
};

