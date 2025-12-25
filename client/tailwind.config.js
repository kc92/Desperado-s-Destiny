/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Desert tones
        desert: {
          sand: '#E6D5B8',
          stone: '#C8B9A1',
          clay: '#A89176',
          dust: '#D4C4A8',
        },
        // Wood tones
        wood: {
          darker: '#2C1810',
          dark: '#3E2723',
          medium: '#5D4037',
          light: '#795548',
          grain: '#8D6E63',
        },
        // Leather tones
        leather: {
          dark: '#3E2723',
          brown: '#6F4E37',
          tan: '#A0826D',
          saddle: '#8B4513',
        },
        // Gold/precious metals
        gold: {
          dark: '#B8860B',
          medium: '#DAA520',
          light: '#FFD700',
          pale: '#EEE8AA',
        },
        // Blood/danger tones
        blood: {
          red: '#8B0000',
          dark: '#5C0000',
          crimson: '#DC143C',
        },
        // Faction colors
        faction: {
          settler: '#4682B4',     // Settler blue
          nahi: '#40E0D0',        // Nahi turquoise
          frontera: '#DC143C',    // Frontera crimson
        },
        // UI utility colors
        western: {
          primary: '#8B4513',     // Saddle brown
          secondary: '#DAA520',   // Goldenrod
          accent: '#DC143C',      // Crimson
          bg: '#F5F5DC',          // Beige
          'bg-dark': '#2C1810',   // Dark brown
          text: '#3E2723',        // Dark wood
          'text-light': '#E6D5B8', // Light sand
        },
      },
      fontFamily: {
        'western': ['Rye', 'serif'],           // Western serif for headings
        'serif': ['Merriweather', 'serif'],    // Readable serif
        'sans': ['Inter', 'sans-serif'],       // Clean sans-serif
        'handwritten': ['Permanent Marker', 'cursive'], // Wanted poster style
      },
      boxShadow: {
        'wood': '0 4px 6px -1px rgba(62, 39, 35, 0.3), 0 2px 4px -1px rgba(62, 39, 35, 0.2)',
        'leather': '0 4px 6px -1px rgba(111, 78, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'gold': '0 4px 14px 0 rgba(255, 215, 0, 0.39)',
        'inner-wood': 'inset 0 2px 4px 0 rgba(62, 39, 35, 0.3)',
      },
      backgroundImage: {
        'wood-grain': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence baseFrequency=\"0.9\" /%3E%3C/filter%3E%3Crect width=\"100\" height=\"100\" filter=\"url(%23noise)\" opacity=\"0.05\" /%3E%3C/svg%3E')",
        'parchment': "linear-gradient(to bottom, #F5F5DC, #E6D5B8)",
      },
      animation: {
        'card-draw': 'cardDraw 0.5s ease-out',
        'card-deal-in': 'cardDealIn 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
        'card-deal-out': 'cardDealOut 0.3s cubic-bezier(0.4, 0, 1, 1)',
        'card-bounce': 'cardBounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'card-glow': 'cardGlow 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'fade-out': 'fadeOut 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'stripes': 'stripes 1s linear infinite',
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'damage-float': 'damageFloat 1s ease-out forwards',
        'hp-shake': 'hpShake 0.5s ease-in-out',
        'damage-flash': 'damageFlash 0.5s ease-out',
        'victory-pulse': 'victoryPulse 0.6s ease-in-out',
        'score-count': 'scoreCount 0.5s ease-out',
        'typewriter': 'typewriter 0.5s steps(20) forwards',
        'float': 'float 4s ease-in-out infinite',
        // Weather effects
        'rain': 'rain 1s linear infinite',
        'dust': 'dust 4s linear infinite',
        'fog-drift': 'fogDrift 15s ease-in-out infinite',
        'lightning': 'lightning 8s ease-in-out infinite',
        'heat-shimmer': 'heatShimmer 3s ease-in-out infinite',
        // Feedback animations
        'success-burst': 'successBurst 1s ease-out forwards',
        'success-check': 'successCheck 0.5s ease-out 0.3s forwards',
        'failure-flash': 'failureFlash 0.5s ease-out',
        'level-up': 'levelUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'particle': 'particle 1.5s ease-out forwards',
        'float-up': 'floatUp 1.5s ease-out forwards',
        'xp-popup': 'xpPopup 1.2s ease-out forwards',
        // Phase 2: UX Polish animations
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
        'bounce-cards': 'bounceCards 0.8s ease-in-out infinite',
        'tumble': 'tumble 2s linear infinite',
        'count-up': 'countUp 0.3s ease-out',
      },
      keyframes: {
        cardDraw: {
          '0%': { transform: 'translateY(100%) rotateZ(-10deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotateZ(0deg)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(20px)', opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        stripes: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '40px 0' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        damageFloat: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '50%': { transform: 'translateY(-50px) scale(1.2)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) scale(0.8)', opacity: '0' },
        },
        hpShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(5px)' },
          '75%': { transform: 'translateX(-3px)' },
        },
        damageFlash: {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '0' },
        },
        victoryPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
        cardDealIn: {
          '0%': { transform: 'translate(-200px, -100px) rotate(-10deg) scale(0.8)', opacity: '0' },
          '70%': { transform: 'translate(0, 0) rotate(2deg) scale(1.05)', opacity: '1' },
          '100%': { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: '1' },
        },
        cardDealOut: {
          '0%': { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(200px, -100px) rotate(10deg) scale(0.8)', opacity: '0' },
        },
        cardBounce: {
          '0%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        cardGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 215, 0, 0.9)' },
        },
        scoreCount: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0.3' },
          '25%': { transform: 'translateY(-10px) translateX(5px)', opacity: '0.5' },
          '50%': { transform: 'translateY(-20px) translateX(0)', opacity: '0.3' },
          '75%': { transform: 'translateY(-10px) translateX(-5px)', opacity: '0.5' },
        },
        // Weather keyframes
        rain: {
          '0%': { transform: 'translateY(-100vh)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        dust: {
          '0%': { transform: 'translateX(-100vw)', opacity: '0' },
          '10%': { opacity: '0.5' },
          '90%': { opacity: '0.5' },
          '100%': { transform: 'translateX(100vw)', opacity: '0' },
        },
        fogDrift: {
          '0%, 100%': { transform: 'translateX(-5%)', opacity: '0.3' },
          '50%': { transform: 'translateX(5%)', opacity: '0.5' },
        },
        lightning: {
          '0%, 45%, 55%, 100%': { backgroundColor: 'rgba(255, 255, 255, 0)' },
          '47%, 53%': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
          '48%, 52%': { backgroundColor: 'rgba(255, 255, 255, 0)' },
          '50%': { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
        },
        heatShimmer: {
          '0%, 100%': { opacity: '0.3', transform: 'scaleY(1)' },
          '50%': { opacity: '0.5', transform: 'scaleY(1.05)' },
        },
        // Feedback animation keyframes
        successBurst: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        successCheck: {
          '0%': { transform: 'scale(0) rotate(-45deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        failureFlash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        levelUp: {
          '0%': { transform: 'scale(0) rotateZ(-10deg)', opacity: '0' },
          '70%': { transform: 'scale(1.1) rotateZ(5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotateZ(0deg)', opacity: '1' },
        },
        particle: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '50%': { opacity: '0.8', transform: 'translateY(-40px) scale(1.2)' },
          '100%': { opacity: '0', transform: 'translateY(-80px) scale(0.5)' },
        },
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '20%': { opacity: '1', transform: 'translateY(-20px) scale(1.1)' },
          '100%': { opacity: '0', transform: 'translateY(-80px) scale(0.9)' },
        },
        xpPopup: {
          '0%': { opacity: '0', transform: 'translateY(0) scale(0.8)' },
          '10%': { opacity: '1', transform: 'translateY(-10px) scale(1)' },
          '90%': { opacity: '1', transform: 'translateY(-30px) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-50px) scale(0.9)' },
        },
        // Phase 2: UX Polish keyframes
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceCards: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        tumble: {
          '0%': { transform: 'rotate(0deg) translateX(0)' },
          '50%': { transform: 'rotate(180deg) translateX(10px)' },
          '100%': { transform: 'rotate(360deg) translateX(0)' },
        },
        countUp: {
          '0%': { transform: 'scale(1.1)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
