/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0B",
        surface: "#111114",
        foreground: "#EDEDED",
        secondary: "#9A9A9F",
        muted: "#52525A",
        accent: "#00D4FF",
        divider: "#1F1F23",
        border: "#2A2A2F",
        "status-green": "#10B981",
        "status-yellow": "#F59E0B",
        "status-red": "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
