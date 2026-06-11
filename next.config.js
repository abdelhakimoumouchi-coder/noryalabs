/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [95],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

module.exports = nextConfig
