/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Use webpack for minification instead of SWC (temporary fix for SIGBUS)
  swcMinify: false,
  
  // Optimize build process
  experimental: {
    forceSwcTransforms: false,
  },
  
  // Custom webpack config to handle memory issues and CSS
  webpack: (config, { dev, isServer }) => {
    // Don't minimize in production to avoid CSS issues
    if (!dev && !isServer) {
      config.optimization.minimize = false; // Changed from true to false
    }
    
    // Reduce memory usage
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        }
      }
    };
    
    return config;
  },
};

export default nextConfig;
