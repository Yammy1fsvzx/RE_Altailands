/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'altailands.ru', 'www.altailands.ru'],
      bodySizeLimit: '10mb'
    },
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_UPLOAD_PATH: '/uploads',
    UPLOAD_PATH: '/app/public/uploads',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'altailands.ru',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.altailands.ru',
        pathname: '/**',
      },
    ],
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig