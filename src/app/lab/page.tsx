import type { Metadata } from "next";
import SoundCheckPage from "@/views/SoundCheck";
import { pageMetadata } from "@/lib/seo";

// Página de admin: no va en el sitemap y no se indexa.
export const metadata: Metadata = pageMetadata({ title: "Prueba de sonido", path: "/lab", noindex: true });

export default function Page() {
  return <SoundCheckPage/>;
}
