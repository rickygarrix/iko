const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts' // 🌍 i18n の設定ファイルのパス（プロジェクトルートからの相対パス）
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  },
  // 必要なら他にも設定追加可能
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'blogger.googleusercontent.com',
      'bqexmwjcmtyypzucndrb.supabase.co'
    ]
  }
};

module.exports = withNextIntl(nextConfig);