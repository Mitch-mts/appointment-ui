/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    // Match the original API base behaviour:
    // previously axios used NEXT_PUBLIC_API_URL || 'http://localhost:8079/v1'.
    const backendBase =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://192.168.100.11:8079/v1';

    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
