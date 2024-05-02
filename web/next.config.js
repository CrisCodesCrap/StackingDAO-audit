/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
  swcMinify: true,
  // exportPathMap: function() {
  //   return {
  //     '/': { page: '/' },
  //   };
  // },
  experimental: {
    scrollRestoration: true,
  },
  images: {
    unoptimized: true,
    domains: ["http://localhost:3001"],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
