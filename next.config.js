const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts',
  {
    locales: ['ja', 'en', 'zh', 'ko'],
    defaultLocale: 'ja',
    localeDetection: false, // 自動検出オフ
  }
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  scrollRestoration: true, // ✅ トップレベルでOK
  reactStrictMode: true,
  images: {
    domains: [
      "blogger.googleusercontent.com",
      "lh3.googleusercontent.com",
      "bqexmwjcmtyypzucndrb.supabase.co",
    ],
  },
};

module.exports = withNextIntl(nextConfig);