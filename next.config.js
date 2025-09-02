/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'example.com',
      'localhost',
      'medicos-backend.com', // Add your actual backend domain
      'storage.googleapis.com', // If you're using Google Cloud Storage
      'amazonaws.com', // If you're using AWS S3
      // Add any other domains you need
    ],
  },
}

module.exports = nextConfig