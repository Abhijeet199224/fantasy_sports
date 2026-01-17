// frontend/next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  
  trailingSlash: true,
  
  images: {
    unoptimized: true,
  },
  
  // Move this outside experimental
  outputFileTracingRoot: path.join(__dirname, '../'),
}

module.exports = nextConfig
