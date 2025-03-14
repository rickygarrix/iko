const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com;"
  }
];

module.exports = {
  experimental: { appDir: true },
  reactStrictMode: true,
  images: {
    domains: ["blogger.googleusercontent.com", "lh3.googleusercontent.com"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};