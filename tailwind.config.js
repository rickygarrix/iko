/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'check-icon': "url('/icons/check.svg')", // ✅ チェックアイコンのパス（public/icons/ に配置）
      },
      fontFamily: {
        zen: ['var(--font-zen-kaku)', 'sans-serif'], // ✅ Zen Kaku Gothic New を追加
      },
    },
  },
  plugins: [],
};