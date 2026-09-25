/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#433FFE',
          50: '#eef0ff',
          100: '#e0e3ff',
          200: '#c7cbfe',
          300: '#a5aafd',
          400: '#7d83fc',
          500: '#575cfb',
          600: '#433FFE',
          700: '#332fdb',
          800: '#2a27b0',
          900: '#25248c',
          950: '#141355',
        },
        brand: {
          50: '#eef0ff',
          100: '#e0e3ff',
          200: '#c7cbfe',
          300: '#a5aafd',
          400: '#7d83fc',
          500: '#575cfb',
          600: '#433FFE',
          700: '#332fdb',
          800: '#2a27b0',
          900: '#25248c',
          950: '#141355',
        },
        secondary: {
          DEFAULT: '#6C6EC7',
          50: '#f6f6fc',
          100: '#ececf9',
          200: '#dadaf3',
          300: '#bebee9',
          400: '#9898dc',
          500: '#6C6EC7',
          600: '#5a5bbe',
          700: '#4a4aa8',
          800: '#3f3f89',
          900: '#37376e',
          950: '#1f1f3e',
        },
        tertiary: {
          DEFAULT: '#0082B3',
          50: '#eff9fc',
          100: '#dcf1f8',
          200: '#bde4f3',
          300: '#8ed0eb',
          400: '#4cb6df',
          500: '#0082B3',
          600: '#006894',
          700: '#045478',
          800: '#094662',
          900: '#0d3a51',
          950: '#052536',
        },
        neutral: {
          DEFAULT: '#777683',
          50: '#f7f7f8',
          100: '#efeff1',
          200: '#e0e0e3',
          300: '#cac9d0',
          400: '#adacb5',
          500: '#8f8e9a',
          600: '#777683',
          700: '#62616c',
          800: '#52515a',
          900: '#46454d',
          950: '#2c2b31',
        },
        surface: {
          900: '#090a0f',
          800: '#0f111a',
          700: '#181b28',
          600: '#232738',
          500: '#32374e',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
