import type { Metadata } from "next";
import LessonItemPage from "@/views/LessonItem";
import { courses } from "@/data/questMock";
import { lessonIdFromSlug, lessonSlug, lessonUrl, moduleIdFromSlug, moduleSlug } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

// Una página HTML por lección (/ejercicios/{módulo}/{lección}). Al compartirla se ve la imagen de su módulo.
export const dynamicParams = false;
export const generateStaticParams = () => courses.flatMap(course => course.lessons.map(lesson => ({ modulo: moduleSlug(course.id), leccion: lessonSlug(lesson.id) })));

export async function generateMetadata({ params }: { params: Promise<{ modulo: string; leccion: string }> }): Promise<Metadata> {
  const { modulo, leccion } = await params;
  const course = courses.find(item => item.id === moduleIdFromSlug(modulo));
  const lesson = course?.lessons.find(item => item.id === lessonIdFromSlug(course.id, leccion));
  if (!course || !lesson) return pageMetadata({ path: "/ejercicios", noindex: true });
  const description = lesson.type === "practice" ? lesson.description : lesson.summary;
  return pageMetadata({ title: `${lesson.title} · ${course.title}`, description, path: lessonUrl(course.id, lesson.id), image: course.image, noindex: !course.available });
}

export default function Page() {
  return <LessonItemPage/>;
}
