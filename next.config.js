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
  // Ensure Puppeteer works on Vercel by not bundling these server-side packages
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  // Ensure chromium binary and libs are included in the trace for the API routes
  outputFileTracingIncludes: {
    'app/api/generate-paper-pdf/route': [
      'node_modules/@sparticuz/chromium/bin/**',
      'node_modules/@sparticuz/chromium/lib/**',
    ],
    'app/api/generate-solutions-pdf/route': [
      'node_modules/@sparticuz/chromium/bin/**',
      'node_modules/@sparticuz/chromium/lib/**',
    ],
  },
};

module.exports = nextConfig;
