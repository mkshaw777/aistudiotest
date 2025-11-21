import type { Config } from 'tailwindcss';

const config = {
  content: [
    './index.html',
    './index.tsx', // main entry file
    './App.tsx',
    './ErrorBoundary.tsx',
    './AuthContext.tsx',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}', // All components including ui sub-folder
  ],
  theme: {
    extend: {
      colors: {
        'mk-blue-primary': '#2563eb',
        'mk-blue-dark': '#1e40af',
        'mk-blue-darker': '#1e3a8a',
        'mk-orange-accent': '#f97316',
        'mk-orange-dark': '#ea580c',
        'mk-gray-text': '#64748b',
        'mk-gray-dark': '#475569',
        'mk-success': '#22c55e',
        'mk-error': '#ef4444',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;