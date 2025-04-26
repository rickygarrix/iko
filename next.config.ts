import withNextIntl from 'next-intl/plugin';
import type { NextConfig } from 'next';

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'blogger.googleusercontent.com',
      'bqexmwjcmtyypzucndrb.supabase.co',
      'maps.googleapis.com'
    ]
  }
};

const config = withNextIntl('./i18n/request.ts')(nextConfig);

export default config;