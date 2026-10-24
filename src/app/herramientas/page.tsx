import type { Metadata } from "next";
import ToolsPage from "@/views/Tools";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Herramientas", description: "Afinador y metrónomo para guitarra, gratis y en el navegador.", path: "/herramientas" });

export default function Page() {
  return <ToolsPage/>;
}
