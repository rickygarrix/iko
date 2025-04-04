/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,              // ✅ 正しい
    scrollRestoration: true,   // ✅ 正しい
  },
  reactStrictMode: true,       // ✅ 正しい
  images: {
    domains: [
      "blogger.googleusercontent.com",
      "lh3.googleusercontent.com",
    ],
  },
  // optimizeFonts, optimizeCss は不要！（Next 13〜自動）
};

module.exports = nextConfig;