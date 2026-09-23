/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F2F1FE',
          100: '#E6E4FD',
          200: '#CDC9FB',
          300: '#ABA4F7',
          400: '#8B81F3',
          500: '#6D64F0',
          600: '#5B52E8', // Primary
          700: '#4A41CF',
          800: '#3B34A6',
          900: '#2C2778',
        },
        ink: {
          DEFAULT: '#101828',
          soft: '#475467',
          muted: '#8A93A6',
        },
        line: '#E8E8F0',
        canvas: '#F6F6FA',
        surface: '#FFFFFF',
        success: {
          50: '#EAFAF0',
          500: '#16A34A',
          600: '#107A3A',
        },
        warn: {
          50: '#FEF5E7',
          500: '#F59E0B',
          600: '#A96F07',
        },
        danger: {
          50: '#FDECEB',
          500: '#EF4444',
          600: '#C62F2F',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        arabic: ['"IBM Plex Sans Arabic"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)',
        lift: '0 8px 24px rgba(16,24,40,.10)',
      }
    },
  },
  plugins: [],
}
