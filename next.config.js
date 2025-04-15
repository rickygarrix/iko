const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts',
  {
    locales: ['ja', 'en', 'zh', 'ko'],
    defaultLocale: 'ja',
  }
);

module.exports = withNextIntl({
  experimental: {
    appDir: true,
    scrollRestoration: true,
  },
  reactStrictMode: true,
  images: {
    domains: [
      "blogger.googleusercontent.com",
      "lh3.googleusercontent.com",
      "bqexmwjcmtyypzucndrb.supabase.co",
    ],
  },
});