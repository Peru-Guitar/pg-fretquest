import type { Metadata } from "next";
import { MetronomePage } from "@/views/Tools";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Metrónomo", description: "Metrónomo online para practicar guitarra con el pulso exacto.", path: "/tools/metronome" });

export default function Page() {
  return <MetronomePage/>;
}
