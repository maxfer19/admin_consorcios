/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.komunidad.com',
      },
    ],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
  },
};

export default nextConfig;
