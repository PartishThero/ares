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
        ares: {
          bg: '#17191c',
          surface: '#22262b',
          'surface-alt': '#292e34',
          border: '#383c41',
          text: '#e8e4dc',
          'text-muted': '#9a9a95',
          accent: '#c47b50',
          'accent-soft': '#8f624a',
          danger: '#cf665d',
          success: '#91a68b',
          warning: '#e0a96d',
          cyan: '#38bdf8',
          neon: '#ff7a30'
        }
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'hud': '0 0 20px rgba(196, 123, 80, 0.15), inset 0 0 15px rgba(196, 123, 80, 0.05)',
        'panel': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glow-accent': '0 0 15px rgba(196, 123, 80, 0.4)',
        'glow-cyan': '0 0 15px rgba(56, 189, 248, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
