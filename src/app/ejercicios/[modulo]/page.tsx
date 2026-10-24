import type { Metadata } from "next";
import LessonPage from "@/views/Lesson";
import { courses } from "@/data/questMock";
import { moduleIdFromSlug, moduleSlug, moduleUrl } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

// Una página HTML por módulo (/ejercicios/{módulo}), con su descripción e imagen para compartir.
export const dynamicParams = false;
export const generateStaticParams = () => courses.map(course => ({ modulo: moduleSlug(course.id) }));

export async function generateMetadata({ params }: { params: Promise<{ modulo: string }> }): Promise<Metadata> {
  const { modulo } = await params;
  const course = courses.find(item => item.id === moduleIdFromSlug(modulo));
  if (!course) return pageMetadata({ path: "/ejercicios", noindex: true });
  return pageMetadata({ title: course.title, description: course.description, path: moduleUrl(course.id), image: course.image, noindex: !course.available });
}

export default function Page() {
  return <LessonPage/>;
}
