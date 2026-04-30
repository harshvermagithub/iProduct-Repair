/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'fdn2.gsmarena.com' },
      { protocol: 'https', hostname: '**.gsmarena.com' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: 'cdn.simpleicons.org' },
      { protocol: 'https', hostname: '1000logos.net' },
      { protocol: 'https', hostname: 'cms-assets.xboxservices.com' },
      { protocol: 'https', hostname: 'assets.nintendo.com' },
      { protocol: 'https', hostname: 'gmedia.playstation.com' },
      { protocol: 'https', hostname: 'www.sony.co.in' },
      { protocol: 'https', hostname: 'www.lg.com' },
      { protocol: 'https', hostname: 'i01.appmifile.com' },
      { protocol: 'https', hostname: '**.samsung.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 's3n.cashify.in' },
      { protocol: 'https', hostname: 'www.boat-lifestyle.com' },
      { protocol: 'https', hostname: '**.cashify.in' },
      { protocol: 'https', hostname: '**.boat-lifestyle.com' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  output: 'standalone',
};

export default nextConfig;
