/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Use webpack for minification instead of SWC
  swcMinify: false,
  
  // Optimize build process
  experimental: {
    forceSwcTransforms: false,
  },
  
  // Custom webpack config to handle memory issues
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.minimize = true;
      config.optimization.minimizer = [];
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
