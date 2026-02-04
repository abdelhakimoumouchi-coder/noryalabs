/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Aucune source distante : seules les images locales (/public, /uploads) seront servies
    remotePatterns: [],
  },
}

module.exports = nextConfig