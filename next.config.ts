import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/greek", destination: "/greek/index.html", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/greek/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
};

export default nextConfig;
