import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff', 100: '#d9ecff', 200: '#bcdcff', 300: '#8ec5ff',
          400: '#59a3ff', 500: '#337dff', 600: '#1b5df5', 700: '#1749e1',
          800: '#193db6', 900: '#1a388f', 950: '#152356',
        },
      },
      fontFamily: { sans: ['ui-sans-serif', 'system-ui', 'Inter', 'sans-serif'] },
    },
  },
  plugins: [],
} satisfies Config;
