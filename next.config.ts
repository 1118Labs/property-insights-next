import { withNetlify } from "@netlify/next";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
    appDir: true,
  },
};

export default withNetlify(nextConfig);
