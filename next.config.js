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
    // Fix for chrome-aws-lambda webpack issues
    config.resolve.alias = {
      ...config.resolve.alias,
      'chrome-aws-lambda': isServer ? 'chrome-aws-lambda' : false,
    };

    if (isServer) {
      config.externals = [...config.externals, 'chrome-aws-lambda'];
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
