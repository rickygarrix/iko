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
      "bqexmwjcmtyypzucndrb.supabase.co",
    ],
  },
};

module.exports = nextConfig;