import { heicLicensePlugin } from "./config/heic-license-plugin.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { dev, isServer, webpack }) {
    if (!dev && !isServer) config.plugins.push(heicLicensePlugin(webpack));
    return config;
  },
};

export default nextConfig;
