import type { Metadata } from "next";
import { Suspense } from "react";
import PracticePage from "@/views/Practice";
import { courses } from "@/data/questMock";
import { lessonIdFromSlug, lessonSlug, lessonUrl, moduleIdFromSlug, moduleSlug, practiceUrl } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

// Sala de práctica de un ejercicio (/practicar/{módulo}/{ejercicio}). No se indexa: su contenido está en /ejercicios/….
export const dynamicParams = false;
export const generateStaticParams = () => courses.flatMap(course => course.lessons.filter(lesson => lesson.type === "practice").map(lesson => ({ modulo: moduleSlug(course.id), leccion: lessonSlug(lesson.id) })));

export async function generateMetadata({ params }: { params: Promise<{ modulo: string; leccion: string }> }): Promise<Metadata> {
  const { modulo, leccion } = await params;
  const course = courses.find(item => item.id === moduleIdFromSlug(modulo));
  const lesson = course?.lessons.find(item => item.id === lessonIdFromSlug(course.id, leccion));
  if (!course || !lesson) return pageMetadata({ title: "Practicar", path: "/practicar", noindex: true });
  const description = lesson.type === "practice" ? lesson.description : course.description;
  // Al compartir la sala, la vista previa es la del ejercicio, con la imagen de su módulo.
  return { ...pageMetadata({ title: `${lesson.title} · ${course.title}`, description, path: practiceUrl(course.id, lesson.id), image: course.image, noindex: true }), alternates: { canonical: lessonUrl(course.id, lesson.id) } };
}

export default function Page() {
  return <Suspense><PracticePage/></Suspense>;
}
