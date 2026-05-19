/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        base: "#111827",
        surface: "#1F2937",

        "light-base": "#F3F4F6",
        "light-on-surface": "#111827",
        "light-on-surface-variant": "#6B7280",

        "on-surface": "#FFFFFF",

        "apple-blue": "#007AFF",
        "apple-green": "#34C759",
        "apple-red": "#FF3B30",
        "apple-orange": "#FF9500"
      },

      boxShadow: {
        apple: "0 4px 12px rgba(0,0,0,0.08)",
        "apple-hover": "0 8px 24px rgba(0,0,0,0.15)"
      }
    }
  },
  plugins: [],
}