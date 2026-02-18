/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./{components,pages,contexts,hooks,utils}/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A', // A shade of blue
        secondary: '#F1F5F9', // A light gray for text on dark backgrounds
        accent: '#F59E0B',   // An amber/yellow color
        'header-bg': '#111827', // Dark gray for header
        'text-dark': '#1F2937',
        'text-light': '#6B7280',
        'status-active': '#16A34A', // Green
        'status-overdue': '#DC2626', // Red
        'highlight': '#3B82F6', // A brighter blue
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-in-fast': 'fadeIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.btn': {
          padding: '.5rem 1rem',
          borderRadius: '.5rem',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s, opacity 0.2s',
          '&:disabled': {
            opacity: '0.6',
            cursor: 'not-allowed',
          },
        },
        '.btn-primary': {
          backgroundColor: '#1E3A8A',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#1E40AF',
          },
        },
        '.btn-secondary': {
            backgroundColor: '#E5E7EB',
            color: '#1F2937',
            border: '1px solid #D1D5DB',
            '&:hover': {
              backgroundColor: '#D1D5DB',
            },
        },
      })
    }
  ],
}