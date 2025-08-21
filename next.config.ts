/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["www.themealdb.com"], // 👈 whitelist external image host
  },
};

module.exports = nextConfig;
