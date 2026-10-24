import type { Metadata } from "next";
import { TunerPage } from "@/views/Tools";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Afinador de guitarra", description: "Afina tu guitarra con el micrófono, gratis y en el navegador.", path: "/herramientas/afinador" });

export default function Page() {
  return <TunerPage/>;
}
