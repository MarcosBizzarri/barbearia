import type { NextConfig } from "next";

// Site 100% estático (pasta `out/`) para publicar no Firebase Hosting.
// Toda a parte dinâmica (login, agenda, fila) roda no navegador via Firebase.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
