import type { Metadata } from "next";
import { Suspense } from "react";
import PracticePage from "@/views/Practice";
import { courses } from "@/data/questMock";
import { pageMetadata } from "@/lib/seo";

// Sala de práctica: no se indexa (el contenido de cada ejercicio está en /modules/{módulo}/{lección}).
export const dynamicParams = false;
export const generateStaticParams = () => courses.map(course => ({ exerciseId: course.id }));

export async function generateMetadata({ params }: { params: Promise<{ exerciseId: string }> }): Promise<Metadata> {
  const { exerciseId } = await params;
  const course = courses.find(item => item.id === exerciseId);
  return pageMetadata({ title: course ? `Practicar · ${course.title}` : "Practicar", description: course?.description, path: `/practice/${exerciseId}`, image: course?.image, noindex: true });
}

// Suspense: la vista lee ?exercise=… de la URL, que en la exportación estática se resuelve en el navegador.
export default function Page() {
  return <Suspense><PracticePage/></Suspense>;
}
