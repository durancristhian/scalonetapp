import { heicLicensePlugin } from "./config/heic-license-plugin.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  async rewrites() {
    return {
      fallback: [
        {
          source: "/:path*",
          has: [{ type: "header", key: "x-scalonet-markdown", value: "1" }],
          destination: "/agent-not-found",
        },
      ],
    };
  },
  async headers() {
    return [
      ...["/", "/about", "/contact", "/privacy"].map((source) => ({
        source,
        headers: [
          { key: "Vary", value: "Accept" },
          { key: "Cache-Control", value: "private, no-store" },
          {
            key: "Link",
            value: `</llms.txt>; rel="describedby", <${source === "/" ? "/index" : source}.md>; rel="alternate"; type="text/markdown"`,
          },
        ],
      })),
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
