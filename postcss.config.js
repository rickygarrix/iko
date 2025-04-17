/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    // Tailwind ⇢ autoprefixer の順に通す
    tailwindcss: {},
    autoprefixer: {}
  }
};