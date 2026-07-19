/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design Tokens
        pitch: {
          DEFAULT: '#10b981', // emerald-500
          light: '#34d399', // emerald-400
          dark: '#059669', // emerald-600
        },
        floodlight: {
          DEFAULT: '#fafafa', // zinc-50
          light: '#ffffff', // white
          dark: '#a1a1aa', // zinc-400
        },
        concourse: {
          DEFAULT: '#09090b', // zinc-950
          light: '#18181b', // zinc-900
          dark: '#000000', // black
        },
        'signal-amber': {
          DEFAULT: '#E8A33D', // Warning / busy state
          light: '#F2B963',
          dark: '#B87B1D',
        },
        'away-red': {
          DEFAULT: '#C23B3B', // Critical alert / congestion
          light: '#D45B5B',
          dark: '#8C2121',
        },
        'assist-blue': {
          DEFAULT: '#3B7EC2', // Data / links / focus state
          light: '#5B9DD4',
          dark: '#21568C',
        },
        // Backwards compatibility and alert helpers mapped to tokens
        alert: {
          low: '#3B7EC2',
          medium: '#E8A33D',
          high: '#E8A33D',
          critical: '#C23B3B',
        },
        pulse: {
          DEFAULT: '#E8A33D',
          bright: '#F2B963',
          dim: '#B87B1D',
        },
      },
      fontFamily: {
        sans: ['Inter', '"Noto Sans Devanagari"', 'sans-serif'],
        display: ['"Big Shoulders Display"', 'sans-serif'],
        body: ['Inter', '"Noto Sans Devanagari"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gold-shimmer': 'goldShimmer 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'scan-line': 'scanLine 3s linear infinite',
        'trophy-float': 'trophyFloat 4s ease-in-out infinite',
        'flag-wave': 'flagWave 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(16,185,129,0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(16,185,129,0.8), 0 0 50px rgba(16,185,129,0.3)' },
        },
        goldShimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scanLine: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
        trophyFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        flagWave: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #10b981 0%, #34d399 40%, #10b981 60%, #059669 100%)',
        'fifa-gradient': 'linear-gradient(135deg, #10b981 0%, #09090b 60%, #10b981 100%)',
        'trophy-shine': 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.2) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};
