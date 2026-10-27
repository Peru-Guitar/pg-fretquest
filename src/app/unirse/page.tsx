import type { Metadata } from "next";
import JoinPage from "@/views/Join";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Únete", description: "Te invitaron a Fret Quest: entrena guitarra eléctrica gratis con un plan según tu nivel, metrónomo, tablaturas y progreso guardado.", path: "/unirse" });

export default function Page() {
  return <JoinPage/>;
}
