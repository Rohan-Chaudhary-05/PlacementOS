import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a2e',
        accent: {
          DEFAULT: '#4f46e5',
          light: '#e0e7ff',
        },
        surface: '#f8f9ff',
        success: '#16a34a',
        muted: '#6b7280',
        'text-primary': '#111827',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
      },
      keyframes: {
        // Quick squash-and-stretch "pop" when a save/applied toggle activates.
        pop: {
          '0%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.28)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        // A ring that bursts outward and fades — the "spark" on activation.
        spark: {
          '0%': { transform: 'scale(0.45)', opacity: '0.6' },
          '100%': { transform: 'scale(2.1)', opacity: '0' },
        },
      },
      animation: {
        pop: 'pop 0.4s ease-out',
        spark: 'spark 0.45s ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
