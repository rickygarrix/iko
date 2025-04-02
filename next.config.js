/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,              // ✅ App Router 使用
    scrollRestoration: true,  // ✅ スクロール位置の復元を Next.js に任せる（v13.4+）
  },
  reactStrictMode: true,
  images: {
    domains: [
      "blogger.googleusercontent.com",
      "lh3.googleusercontent.com"
    ],
  },
};

module.exports = nextConfig;