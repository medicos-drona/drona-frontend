/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'example.com',
      'localhost',
      'medicos-backend.com',
      'storage.googleapis.com',
      'amazonaws.com',
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for @sparticuz/chromium webpack issues
    config.resolve.alias = {
      ...config.resolve.alias,
      '@sparticuz/chromium': isServer ? '@sparticuz/chromium' : false,
    };

    if (isServer) {
      config.externals = [...config.externals, '@sparticuz/chromium'];
    }

    // Ignore problematic files
    config.module.rules.push({
      test: /\.js\.map$/,
      loader: 'ignore-loader'
    });

    return config;
  },
}

module.exports = nextConfig
