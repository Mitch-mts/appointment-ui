/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NEXT_PUBLIC_BASE_PATH
    ? { basePath: process.env.NEXT_PUBLIC_BASE_PATH }
    : {}),
  output: 'standalone',
  // Avoid MUI CJS/ESM interop issues with Next 14 (useMediaQuery barrel).
  transpilePackages: [
    '@mui/material',
    '@mui/system',
    '@mui/icons-material',
    '@mui/x-date-pickers',
  ],
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
