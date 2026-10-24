import { Suspense } from "react";
import { LegacyRedirect } from "@/components/LegacyRedirect";

// También es la 404.html de GitHub Pages: redirige los enlaces antiguos a sus rutas nuevas.
export default function NotFound() {
  return <Suspense><LegacyRedirect/></Suspense>;
}
