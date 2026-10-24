import type { Metadata } from "next";
import { Suspense } from "react";
import PracticePage from "@/views/Practice";
import { courses } from "@/data/questMock";
import { moduleIdFromSlug, moduleSlug, practiceUrl } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

// Sala de práctica del módulo (primer ejercicio o rutina). No se indexa.
export const dynamicParams = false;
export const generateStaticParams = () => courses.map(course => ({ modulo: moduleSlug(course.id) }));

export async function generateMetadata({ params }: { params: Promise<{ modulo: string }> }): Promise<Metadata> {
  const { modulo } = await params;
  const course = courses.find(item => item.id === moduleIdFromSlug(modulo));
  return pageMetadata({ title: course ? `Practicar · ${course.title}` : "Practicar", description: course?.description, path: course ? practiceUrl(course.id) : "/practicar", image: course?.image, noindex: true });
}

// Suspense: la vista lee ?sesion y ?rutina de la URL, que en la exportación estática se resuelven en el navegador.
export default function Page() {
  return <Suspense><PracticePage/></Suspense>;
}
