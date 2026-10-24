import type { Metadata } from "next";
import LessonItemPage from "@/views/LessonItem";
import { courses } from "@/data/questMock";
import { pageMetadata } from "@/lib/seo";

// Una página HTML por lección (lectura o ejercicio), con su descripción y la imagen de su módulo.
export const dynamicParams = false;
export const generateStaticParams = () => courses.flatMap(course => course.lessons.map(lesson => ({ moduleId: course.id, lessonId: lesson.id })));

export async function generateMetadata({ params }: { params: Promise<{ moduleId: string; lessonId: string }> }): Promise<Metadata> {
  const { moduleId, lessonId } = await params;
  const course = courses.find(item => item.id === moduleId);
  const lesson = course?.lessons.find(item => item.id === lessonId);
  const path = `/modules/${moduleId}/${lessonId}`;
  if (!course || !lesson) return pageMetadata({ path, noindex: true });
  const description = lesson.type === "practice" ? lesson.description : lesson.summary;
  return pageMetadata({ title: `${lesson.title} · ${course.title}`, description, path, image: course.image, noindex: !course.available });
}

export default function Page() {
  return <LessonItemPage/>;
}
