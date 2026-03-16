/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    // Proxy all frontend `/api/*` calls to the Java backend,
    // keeping browser requests same-origin (supports HTTPS frontend + HTTP backend).
    const backendBase =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8079/v1';

    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
