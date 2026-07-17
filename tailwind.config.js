/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/components/**/*.{js,jsx,mdx}",
    "./src/app/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ["var(--font-sora)", "sans-serif"],
        dm: ["var(--font-dm)", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#EBF3FF",
          100: "#C8DFFE",
          200: "#91BDFD",
          400: "#378ADD",
          500: "#1A6BCC",
          600: "#1558B0",
          700: "#0F4490",
          900: "#042C53",
        },
        success: {
          50: "#E6F7F1",
          100: "#C0EAD9",
          400: "#1D9E75",
          500: "#17845F",
          600: "#0F6E56",
        },
        amber: {
          50: "#FAEEDA",
          400: "#EF9F27",
          600: "#854F0B",
          800: "#412402",
        },
        danger: {
          50: "#FCEBEB",
          400: "#E24B4A",
          600: "#A32D2D",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-right": "slideRight 0.4s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

module.exports = config;
