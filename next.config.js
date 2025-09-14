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
  experimental: {
    // Ensure Playwright's locally-installed browsers are included in the serverless bundle
outputFileTracingIncludes: {
  'src/app/api/generate-paper-pdf/route': [
    './node_modules/playwright/.local-browsers/**',
  ],
  'src/app/api/generate-solutions-pdf/route': [
    './node_modules/playwright/.local-browsers/**',
  ],
},
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
