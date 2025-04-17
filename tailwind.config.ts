import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      backgroundImage: {
        /* public/icons/check.svg */
        'check-icon': "url('/icons/check.svg')"
      },
      fontFamily: {
        /* Zen Kaku Gothic New を利用する例 */
        zen: ['var(--font-zen-kaku)', 'sans-serif']
      },
      colors: {
        /* CSS カスタムプロパティと連動させたい場合 */
        background: 'var(--background)',
        foreground: 'var(--foreground)'
      }
    }
  },
  plugins: []
};

export default config;