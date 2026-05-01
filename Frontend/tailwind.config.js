/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        head: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        night:   { DEFAULT: "#030a0f", 2: "#071218", 3: "#0c1c27" },
        edge:    { DEFAULT: "#0e2535", 2: "#163347" },
        brand:   { DEFAULT: "#00d4ff", dim: "#0099cc" },
        lime:    "#00ff9d",
        ember:   "#ff6b35",
        danger:  "#ff3d5a",
        warn:    "#ffb800",
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: "translateY(14px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        msgIn:    { from: { opacity: 0, transform: "translateY(8px)"  }, to: { opacity: 1, transform: "translateY(0)" } },
        toastIn:  { from: { opacity: 0, transform: "translateX(20px)" }, to: { opacity: 1, transform: "translateX(0)" } },
        bounce3:  { "0%,60%,100%": { transform: "translateY(0)" },       "30%": { transform: "translateY(-6px)" } },
        mapPulse: { "0%,100%": { transform: "translate(-50%,-50%) scale(1)", opacity: 0.8 }, "50%": { transform: "translate(-50%,-50%) scale(2.2)", opacity: 0 } },
        glow:     { "0%,100%": { opacity: 0.6 }, "50%": { opacity: 1 } },
      },
      animation: {
        fadeUp:   "fadeUp 0.45s ease both",
        msgIn:    "msgIn 0.3s ease both",
        toastIn:  "toastIn 0.3s ease both",
        bounce3:  "bounce3 1.4s ease-in-out infinite",
        mapPulse: "mapPulse 2.5s ease-in-out infinite",
        glow:     "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
