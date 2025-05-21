import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'cdn.discordapp.com',
      'scontent.cdninstagram.com',
      'scontent-iad3-1.cdninstagram.com',
      'instagram.fmex5-1.fna.fbcdn.net',
      'static.xx.fbcdn.net',
      'scontent.xx.fbcdn.net',
      // Keep any other domains you already have here
    ],
  },
};

export default nextConfig;
