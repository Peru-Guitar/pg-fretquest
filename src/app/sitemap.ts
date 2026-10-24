import type { MetadataRoute } from "next";
import { courses } from "@/data/questMock";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

/** Solo páginas públicas: inicio, ejercicios, guía, herramientas, y cada módulo y lección publicados. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/train", "/guide", "/tools", "/tools/tuner", "/tools/metronome", "/about"];
  const published = courses.filter(course => course.available);
  return [
    ...pages.map(path => ({ url: `${SITE_URL}${path}` })),
    ...published.map(course => ({ url: `${SITE_URL}/modules/${course.id}` })),
    ...published.flatMap(course => course.lessons.map(lesson => ({ url: `${SITE_URL}/modules/${course.id}/${lesson.id}` }))),
  ];
}
