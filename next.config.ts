import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chỉ bật standalone khi chạy build cho Docker/VPS tự host
  ...(process.env.BUILD_STANDALONE === "true" ? { output: "standalone" } : {}),
};

export default nextConfig;
