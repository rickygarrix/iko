// next.config.ts
import withNextIntl from 'next-intl/plugin';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["your-image-domain.com"],
  },
};

export default withNextIntl('./i18n/request.ts')(nextConfig);