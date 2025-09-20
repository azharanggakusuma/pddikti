// next.config.ts
import type { NextConfig } from "next";

const { version } = require('./package.json');

const nextConfig: NextConfig = {
  env: {
    // Menjadikan versi aplikasi tersedia sebagai environment variable
    NEXT_PUBLIC_APP_VERSION: version,
  },
  /* config options here */
};

export default nextConfig;