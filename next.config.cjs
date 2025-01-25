/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Enable TypeScript checking during build
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    // Add custom webpack configurations
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        // Add any necessary aliases here
      },
      fallback: {
        ...config.resolve.fallback,
        // Add any necessary fallbacks here
      }
    };
    return config;
  },
  experimental: {
    // Enable modern web features
    esmExternals: true,
    externalDir: true,
  },
  images: {
    // Configure image optimization
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
