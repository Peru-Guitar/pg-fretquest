import type { Metadata } from "next";

/**
 * Meta de cada página para SEO y vista previa al compartir (WhatsApp, Facebook, X…).
 * Si la página no tiene imagen propia, se usa la de Fret Quest.
 */
export const SITE_URL = "https://fretquest.peruguitar.com";
export const SITE_NAME = "Fret Quest";
export const DEFAULT_DESCRIPTION = "Tu gimnasio de guitarra eléctrica. Entrena coordinación, limpieza y control. Un producto de PeruGuitar.";
const DEFAULT_IMAGE = { url: "/images/og-fretquest.jpg", width: 1200, height: 630, alt: "Fret Quest: entrenamiento de guitarra de PeruGuitar." };

export function pageMetadata({ title, description = DEFAULT_DESCRIPTION, path, image, noindex = false }: {
  title?: string; description?: string; path: string; image?: string; noindex?: boolean;
}): Metadata {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} · Más control. Menos esfuerzo.`;
  const images = [image ? { url: image, alt: title ?? SITE_NAME } : DEFAULT_IMAGE];
  return {
    title: fullTitle,
    description,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: { type: "website", locale: "es_PE", siteName: SITE_NAME, title: fullTitle, description, url: path, images },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: images.map(item => item.url) },
  };
}
