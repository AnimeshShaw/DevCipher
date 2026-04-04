import type { NextConfig } from 'next'

const config: NextConfig = {
  // Static export for GitHub Pages
  output: 'export',

  // Required for static hosting — trailing slashes ensure /tools/sha256/index.html resolves correctly
  trailingSlash: true,

  // GitHub Pages doesn't run Next.js Image Optimization
  images: {
    unoptimized: true,
  },

  // basePath: set to '/repo-name' only if NOT using a custom domain
  // e.g. basePath: '/devcipher'
  // Leave empty when using devcipher.dev

  turbopack: {},

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
}

export default config
