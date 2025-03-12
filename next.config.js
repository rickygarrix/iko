const nextConfig = {
  experimental: { appDir: true }, // ✅ App Routerを有効化
  reactStrictMode: true, // ✅ デバッグ強化
  images: {
    domains: ["blogger.googleusercontent.com", "lh3.googleusercontent.com"], // ✅ 必要なドメインを追加
  },
};

module.exports = nextConfig;