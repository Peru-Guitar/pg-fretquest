import type { Metadata } from "next";
import LessonPage from "@/views/Lesson";
import { courses } from "@/data/questMock";
import { pageMetadata } from "@/lib/seo";

// Una página HTML por módulo, con su descripción e imagen para compartir.
export const dynamicParams = false;
export const generateStaticParams = () => courses.map(course => ({ moduleId: course.id }));

export async function generateMetadata({ params }: { params: Promise<{ moduleId: string }> }): Promise<Metadata> {
  const { moduleId } = await params;
  const course = courses.find(item => item.id === moduleId);
  if (!course) return pageMetadata({ path: `/modules/${moduleId}`, noindex: true });
  return pageMetadata({ title: course.title, description: course.description, path: `/modules/${course.id}`, image: course.image, noindex: !course.available });
}

export default function Page() {
  return <LessonPage/>;
}
