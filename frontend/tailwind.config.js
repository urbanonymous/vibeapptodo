/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B1220",
        card: "rgba(255,255,255,0.06)",
        border: "rgba(255,255,255,0.10)",
        text: "#E6EDF7",
        muted: "rgba(230,237,247,0.72)",
        accent: "#14b8a6",
        warn: "#f59e0b",
        danger: "#ef4444"
      }
    }
  },
  plugins: []
};

