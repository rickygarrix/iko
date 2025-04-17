import withNextIntl from 'next-intl/plugin';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { /* ... */ }
};

/* ★ path だけを渡して 2 段階目で nextConfig を渡す */
export default withNextIntl('./i18n/request.ts')(nextConfig);