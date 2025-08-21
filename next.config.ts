/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["www.themealdb.com"], // 👈 whitelist external image host
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://62.146.182.119:4003/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
