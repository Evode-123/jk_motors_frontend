/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "'Syne'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#C9A84C",
          light: "#E8C96A",
          dark: "#8B6914",
          muted: "#A07830",
        },
        gold: {
          50:  "#FBF5E6",
          100: "#F5E4B8",
          200: "#EDD080",
          300: "#E8C96A",
          400: "#C9A84C",
          500: "#A07830",
          600: "#8B6914",
          700: "#6B5010",
          800: "#3D2E09",
          900: "#1E1704",
        },
        surface: {
          DEFAULT: "#141008",
          2: "#1C1609",
          3: "#241C0C",
          4: "#2E2410",
          5: "#3A2E14",
        },
        dark: "#0A0804",
        charcoal: "#111009",
      },
      backgroundImage: {
        "dark-texture": "radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,105,20,0.04) 0%, transparent 50%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "shimmer": "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        "gold": "0 0 20px rgba(201,168,76,0.15), 0 0 40px rgba(201,168,76,0.05)",
        "gold-sm": "0 0 10px rgba(201,168,76,0.12)",
        "card": "0 4px 24px rgba(0,0,0,0.4)",
      },
      borderColor: {
        gold: {
          DEFAULT: "rgba(201,168,76,0.3)",
          dim: "rgba(201,168,76,0.15)",
          bright: "rgba(201,168,76,0.5)",
        },
      },
    },
  },
  plugins: [],
};