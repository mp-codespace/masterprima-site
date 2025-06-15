// File path: tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'urbanist': ['var(--font-urbanist)', 'Inter', 'sans-serif'],
        'plus-jakarta': ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          orange: '#F97316',
          red: '#E50012',
          accent: '#F18546',
        },
        secondary: {
          sand: '#FFF7ED',
          lemon: '#FFF9DB',
          'orange-300': '#fdb274',
          muted: '#6B7280'
        },
        neutral: {
          charcoal: '#1F1F1F',
          'dark-gray': '#4B5563',
          cream: '#FFFCF9',
          'navy-dark': '#1A1A2E',
        }
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        '3xl': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'xl': ['1.5rem', { lineHeight: '1.3', fontWeight: '500' }],
        'base': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'xs': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
      }
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/typography'),
  ],
};
