/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Autorise le HMR via ton IP locale
    allowedDevOrigins: ['http://192.168.100.7:3000'],
  },
}

module.exports = nextConfig