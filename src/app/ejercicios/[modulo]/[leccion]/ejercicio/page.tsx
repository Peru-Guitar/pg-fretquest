import type { Metadata } from "next";
import LessonItemPage from "@/views/LessonItem";
import { courses } from "@/data/questMock";
import { exerciseUrl, lessonIdFromSlug, lessonSlug, moduleIdFromSlug, moduleSlug } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

// Sala de práctica de cada ejercicio (/ejercicios/{módulo}/{lección}/ejercicio); su objetivo vive en la página de la lección.
export const dynamicParams = false;
export const generateStaticParams = () => courses.flatMap(course => course.lessons.filter(lesson => lesson.type === "practice").map(lesson => ({ modulo: moduleSlug(course.id), leccion: lessonSlug(lesson.id) })));

export async function generateMetadata({ params }: { params: Promise<{ modulo: string; leccion: string }> }): Promise<Metadata> {
  const { modulo, leccion } = await params;
  const course = courses.find(item => item.id === moduleIdFromSlug(modulo));
  const lesson = course?.lessons.find(item => item.id === lessonIdFromSlug(course.id, leccion));
  if (!course || !lesson || lesson.type !== "practice") return pageMetadata({ path: "/ejercicios", noindex: true });
  return pageMetadata({ title: `${lesson.title} · Ejercicio · ${course.title}`, description: lesson.description, path: exerciseUrl(course.id, lesson.id), image: course.image, noindex: !course.available });
}

export default function Page() {
  return <LessonItemPage view="practice"/>;
}
