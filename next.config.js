/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true, // `app/` ディレクトリを有効にする
  },
  reactStrictMode: true,
  output: "standalone", // 🔴 追加する
};

module.exports = nextConfig;