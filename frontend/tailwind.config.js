/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medcare: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        pastel: {
          pink: '#FFE4E6',
          rose: '#FDA4AF',
          lavender: '#EDE9FE',
          violet: '#DDD6FE',
          sky: '#E0F2FE',
          cyan: '#CFFAFE',
          mint: '#D1FAE5',
          emerald: '#A7F3D0',
          peach: '#FFEDD5',
          amber: '#FEF3C7',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'glass-md': '0 8px 32px 0 rgba(31, 38, 135, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'glass-lg': '0 16px 48px 0 rgba(31, 38, 135, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        'glow-pink': '0 0 35px -5px rgba(244, 63, 94, 0.35)',
        'glow-cyan': '0 0 35px -5px rgba(6, 182, 212, 0.35)',
        'glow-purple': '0 0 35px -5px rgba(168, 85, 247, 0.35)',
        'glow-emerald': '0 0 35px -5px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 35px -5px rgba(245, 158, 11, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      }
    },
  },
  plugins: [],
}
