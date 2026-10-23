import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Versión de la app (package.json), visible en la barra lateral.
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
