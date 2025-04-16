// next.config.js

const withNextIntl = require('next-intl/plugin')('./i18n/request.ts', {
  locales: ['ja', 'en', 'zh', 'ko'],
  defaultLocale: 'ja',
  localeDetection: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // experimental: {
  //   scrollRestoration: true,  // この行を削除
  //   appDir: true,  // Next.js 15.3.0では不要
  // },
  images: {
    domains: [
      'blogger.googleusercontent.com',
      'lh3.googleusercontent.com',
      'bqexmwjcmtyypzucndrb.supabase.co',
    ],
  },
};

module.exports = withNextIntl(nextConfig);