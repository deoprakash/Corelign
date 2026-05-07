/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', 'ui-serif', 'serif'],
      },
      boxShadow: {
        glow: '0 20px 60px -30px rgba(15, 118, 110, 0.45)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        fadeUp: 'fadeUp 0.9s ease-out both',
        shimmer: 'shimmer 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
