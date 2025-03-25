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
    },
  },
  plugins: [],
};