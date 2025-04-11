/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    scrollRestoration: true,
  },
  reactStrictMode: true,
  images: {
    domains: [
      "blogger.googleusercontent.com",
      "lh3.googleusercontent.com",
      "bqexmwjcmtyypzucndrb.supabase.co", // ⭐️ 追加！Supabase用
    ],
  },
};

module.exports = nextConfig;