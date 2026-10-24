import type { MetadataRoute } from "next";
import { courses } from "@/data/questMock";
import { lessonUrl, moduleUrl, ROUTES } from "@/lib/routes";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

/** Solo páginas públicas: inicio, ejercicios, guía, herramientas, y cada módulo y lección publicados. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [ROUTES.home, ROUTES.exercises, ROUTES.guide, ROUTES.tools, ROUTES.tuner, ROUTES.metronome, ROUTES.about];
  const published = courses.filter(course => course.available);
  return [
    ...pages.map(path => ({ url: `${SITE_URL}${path}` })),
    ...published.map(course => ({ url: `${SITE_URL}${moduleUrl(course.id)}` })),
    ...published.flatMap(course => course.lessons.map(lesson => ({ url: `${SITE_URL}${lessonUrl(course.id, lesson.id)}` }))),
  ];
}
