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
};

module.exports = nextConfig;
