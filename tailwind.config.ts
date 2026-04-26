import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f2f5f3',
          100: '#e0e8e3',
          200: '#c2d1c8',
          300: '#9bb3a5',
          400: '#7a9a88',
          500: '#5B7B6F',
          600: '#4a6459',
          700: '#3d5149',
          800: '#33413c',
          900: '#2b3632',
          950: '#161d1a',
        },
        gold: {
          50: '#fffdf5',
          100: '#fff8e1',
          200: '#ffecb3',
          300: '#FFD700',
          400: '#C5A55A',
          500: '#D4AF37',
          600: '#B8860B',
          700: '#996515',
          800: '#7a4f10',
          900: '#5c3a0c',
        },
        brand: {
          brown: '#3D2B1F',
          cream: '#F5F0EB',
          dark: '#1a1f1c',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
