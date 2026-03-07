import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // AfricaVet Primary Colors
        'av-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'av-blue': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'av-orange': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        'av-dark': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Legacy Cameroon Colors
        'cameroon-green': '#007A33',
        'cameroon-red': '#CE1126',
        'cameroon-yellow': '#FCD116',
        // Legacy One Health Colors
        'oh-blue': '#2196F3',
        'oh-green': '#4CAF50',
        'oh-orange': '#FF9800',
        'oh-teal': '#009688',
        'oh-purple': '#9B59B6',
        'oh-ohwr': '#8B9A2D',
        // UI Colors
        'oh-background': '#F5F7FA',
        'oh-dark': '#263238',
        'oh-dark-gray': '#37474F',
        'oh-gray': '#607D8B',
        'oh-light-blue': '#E3F2FD',
        'oh-light-green': '#E8F5E9',
        'oh-light-orange': '#FFF3E0',
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'Nunito', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'shine': 'shine 4s ease-in-out infinite',
        'banner-shine': 'bannerShine 5s ease-in-out infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        // New glassmorphism animations
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'fade-in-left': 'fadeInLeft 0.6s ease-out forwards',
        'fade-in-right': 'fadeInRight 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'ticker': 'ticker 30s linear infinite',
        'ticker-fast': 'ticker 15s linear infinite',
        'ken-burns': 'kenBurns 20s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'slide-in-bottom': 'slideInBottom 0.5s ease-out forwards',
        'count-up': 'countUp 2s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '200%' },
        },
        bannerShine: {
          '0%': { left: '-50%' },
          '100%': { left: '150%' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(60px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-60px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(22, 163, 74, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(22, 163, 74, 0.6)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(22, 163, 74, 0.4), 0 0 20px rgba(22, 163, 74, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(22, 163, 74, 0.6), 0 0 40px rgba(22, 163, 74, 0.4)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '50%': { transform: 'scale(1.1) translate(-1%, -1%)' },
          '100%': { transform: 'scale(1.05) translate(1%, 1%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.1)',
        'glass-lg': '0 16px 48px 0 rgba(31, 38, 135, 0.2)',
        'glass-xl': '0 24px 64px 0 rgba(31, 38, 135, 0.25)',
        'neon-green': '0 0 20px rgba(22, 163, 74, 0.5)',
        'neon-green-lg': '0 0 40px rgba(22, 163, 74, 0.6)',
        'neon-blue': '0 0 20px rgba(14, 165, 233, 0.5)',
        'neon-orange': '0 0 20px rgba(249, 115, 22, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.1)',
        'card-hover': '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #2196F3 0%, #00BCD4 40%, #4CAF50 100%)',
        'cameroon-gradient': 'linear-gradient(90deg, #007A33 0%, #007A33 28%, #CE1126 33%, #CE1126 67%, #FCD116 72%, #FCD116 100%)',
        // New glassmorphism gradients
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'av-gradient': 'linear-gradient(135deg, #16a34a 0%, #059669 50%, #0d9488 100%)',
        'av-gradient-dark': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        'av-gradient-hero': 'linear-gradient(135deg, rgba(22, 163, 74, 0.9) 0%, rgba(5, 150, 105, 0.85) 50%, rgba(14, 165, 233, 0.8) 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, rgba(22, 163, 74, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(14, 165, 233, 0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(249, 115, 22, 0.2) 0px, transparent 50%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
    },
  },
  plugins: [],
};

export default config;
