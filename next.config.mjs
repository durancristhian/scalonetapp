import { heicLicensePlugin } from "./config/heic-license-plugin.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/download/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
  outputFileTracingIncludes: {
    "/api/export-backgrounds/v1": ["./public/images/export-backgrounds/*.svg"],
  },
  webpack(config, { dev, isServer, webpack }) {
    if (!dev && !isServer) config.plugins.push(heicLicensePlugin(webpack));
    return config;
  },
};

export default nextConfig;
