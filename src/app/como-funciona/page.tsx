import type { Metadata } from "next";
import GuidePage from "@/views/Guide";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Cómo funciona", description: "Tu guía de entrenamiento: el plan según tu nivel, tu ritmo semanal, cómo practicar un ejercicio, leer la tablatura y cómo se arman los ejercicios.", path: "/como-funciona" });

export default function Page() {
  return <GuidePage/>;
}
