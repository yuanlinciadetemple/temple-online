import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lacquer: "#7A1F2B", // 漆紅：主色
        lacquerDark: "#5A1620",
        gold: "#C6A15B", // 廟宇金：邊框、強調
        goldSoft: "#E4CE9B",
        ink: "#241812", // 深木色：文字
        parchment: "#F4ECDC", // 米卡紙：卡片底
        ember: "#D8622A", // 香火橘：行動按鈕
      },
      fontFamily: {
        serifTC: ["'Noto Serif TC'", "serif"],
        sansTC: ["'Noto Sans TC'", "sans-serif"],
      },
      boxShadow: {
        plaque: "0 6px 20px rgba(36, 24, 18, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
