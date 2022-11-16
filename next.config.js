/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  videos: {
    domains: ["firebasestorage.googleapis.com"],
  },
};

module.exports = nextConfig;
