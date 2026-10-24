import type { Metadata } from "next";
import LearnPage from "@/views/Learn";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Ejercicios", description: "Todos los módulos de Fret Quest: digitación, arpegios, estudios y más. Elige qué quieres mejorar y practica con tablatura y metrónomo.", path: "/ejercicios" });

export default function Page() {
  return <LearnPage/>;
}
