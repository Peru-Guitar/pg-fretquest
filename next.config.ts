import type { NextConfig } from "next";
import pkg from "./package.json" with { type: "json" };

/**
 * Exportación estática para GitHub Pages: cada ruta pública sale como HTML con su contenido y sus meta
 * (SEO y vista previa al compartir). Todo lo que necesita navegador (Firebase, audio, localStorage)
 * se ejecuta en el cliente, igual que antes.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Versión de la app (package.json), visible en la barra lateral.
  env: { NEXT_PUBLIC_APP_VERSION: pkg.version },
};

export default nextConfig;
