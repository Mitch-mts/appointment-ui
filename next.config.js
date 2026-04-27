/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NEXT_PUBLIC_BASE_PATH
    ? { basePath: process.env.NEXT_PUBLIC_BASE_PATH }
    : {}),
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    // Match the original API base behaviour:
    // previously axios used NEXT_PUBLIC_API_URL || 'http://localhost:8079/v1'.
    const backendBase =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://197.221.251.35:8079/v1';

    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
