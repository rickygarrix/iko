const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  },
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'blogger.googleusercontent.com',
      'bqexmwjcmtyypzucndrb.supabase.co',
      'maps.googleapis.com' // ← これを追加！！
    ]
  }
};

module.exports = withNextIntl(nextConfig);