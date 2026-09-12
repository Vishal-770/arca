import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'ethglobal.storage' },
      { protocol: 'https', hostname: 'inkonchain.com' },
      { protocol: 'https', hostname: 'cryptologos.cc' },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/_mintlify/:path*",
        destination: "https://arca-3fddca6f.mintlify.dev/_mintlify/:path*",
      },
      {
        source: "/api/request",
        destination: "https://arca-3fddca6f.mintlify.dev/_mintlify/api/request",
      },
      {
        source: "/docs",
        destination: "https://arca-3fddca6f.mintlify.dev/docs",
      },
      {
        source: "/docs/:path*",
        destination: "https://arca-3fddca6f.mintlify.dev/:path*",
      },
    ];
  },
};

export default nextConfig;
