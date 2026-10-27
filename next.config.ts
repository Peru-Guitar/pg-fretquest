import type { NextConfig } from "next";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import pkg from "./package.json" with { type: "json" };

// Identifica cada build (el commit en GitHub Actions). Se publica en /version.json para que la app
// abierta detecte que salió una versión nueva y ofrezca recargar (ver UpdatePrompt).
const buildId = process.env.GITHUB_SHA ?? execSync("git rev-parse HEAD").toString().trim();
if (process.env.NODE_ENV === "production") writeFileSync("public/version.json", JSON.stringify({ buildId }));

/**
 * Exportación estática para GitHub Pages: cada ruta pública sale como HTML con su contenido y sus meta
 * (SEO y vista previa al compartir). Todo lo que necesita navegador (Firebase, audio, localStorage)
 * se ejecuta en el cliente, igual que antes.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Versión de la app (package.json), visible en la barra lateral.
  env: { NEXT_PUBLIC_APP_VERSION: pkg.version, NEXT_PUBLIC_BUILD_ID: buildId },
};

export default nextConfig;
