import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ancla la raíz del monorepo a este directorio: evita que Next.js suba a
  // buscar un lockfile fuera del repo git (ver advertencia de "outside the
  // current Git repository" en `next build`/`next dev`).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
