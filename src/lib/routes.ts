import { courses } from "@/data/questMock";

/**
 * Rutas de la app, en español. Las URL usan slugs legibles (`/ejercicios/arpegios/arpegios-maj7`);
 * por dentro se siguen usando los ids de siempre (`arpeggios`, `arpeggios-maj7`), que son los que guarda
 * Firestore: cambiar un título cambia su URL, pero no pierde el progreso.
 */
export const ROUTES = {
  home: "/",
  exercises: "/ejercicios",
  plan: "/mi-plan",
  account: "/mi-cuenta",
  community: "/comunidad",
  login: "/entrar",
  retakeQuiz: "/entrar?repetir",
  guide: "/como-funciona",
  tools: "/herramientas",
  tuner: "/herramientas/afinador",
  metronome: "/herramientas/metronomo",
  about: "/acerca-de",
  changelog: "/novedades",
  analytics: "/analytics",
  userProfile: "/perfil",
};

/** Slug del módulo en la URL. */
const MODULE_SLUGS: Record<string, string> = {
  recommendations: "recomendaciones",
  fingering: "digitacion",
  arpeggios: "sweep-picking",
  "alternate-picking": "pua-alternada",
  "economy-picking": "economy-picking",
  scales: "escalas",
  "bending-vibrato": "bending-y-vibrato",
  legato: "legato",
  tapping: "tapping",
  pentatonic: "pentatonica",
  "licks-phrasing": "estudios",
};

/** «Arpegios Maj7» → «arpegios-maj7». */
export const slugify = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Slugs de lección a partir del título. Regla: título y slug son únicos en toda la app (lo comprueba
// tests/slugs.test.ts); la numeración es solo una red de seguridad.
const lessonSlugs = new Map<string, string>();
const lessonsBySlug = new Map<string, string>();
for (const course of courses) {
  const used = new Set<string>();
  for (const lesson of course.lessons) {
    const base = slugify(lesson.title);
    let slug = base || lesson.id;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    used.add(slug);
    lessonSlugs.set(lesson.id, slug);
    lessonsBySlug.set(`${course.id}/${slug}`, lesson.id);
  }
}

export const moduleSlug = (moduleId: string) => MODULE_SLUGS[moduleId] ?? moduleId;
export const lessonSlug = (lessonId: string) => lessonSlugs.get(lessonId) ?? lessonId;

/** Del slug de la URL al id interno. */
export const moduleIdFromSlug = (slug: string | undefined) => {
  if (!slug) return undefined;
  const decoded = decodeURIComponent(slug);
  return Object.entries(MODULE_SLUGS).find(([, value]) => value === decoded)?.[0] ?? decoded;
};
export const lessonIdFromSlug = (moduleId: string | undefined, slug: string | undefined) => {
  if (!moduleId || !slug) return undefined;
  const decoded = decodeURIComponent(slug);
  return lessonsBySlug.get(`${moduleId}/${decoded}`) ?? decoded;
};

export const moduleUrl = (moduleId: string) => `${ROUTES.exercises}/${moduleSlug(moduleId)}`;
/** Página de una lección: lectura o ficha del ejercicio. */
export const lessonUrl = (moduleId: string, lessonId: string) => `${moduleUrl(moduleId)}/${lessonSlug(lessonId)}`;
/**
 * La página de un ejercicio ES su sala de práctica (misma URL que `lessonUrl`). Sin ejercicio, el primero del módulo.
 * `query`: «sesion»…
 */
export const practiceUrl = (moduleId: string, lessonId?: string, query?: string) => {
  const lesson = lessonId ?? courses.find(course => course.id === moduleId)?.lessons.find(item => item.type === "practice")?.id;
  return `${lesson ? lessonUrl(moduleId, lesson) : moduleUrl(moduleId)}${query ? `?${query}` : ""}`;
};
/** Sala de práctica del ejercicio (`…/ejercicio`); la página de la lección queda para su objetivo. */
export const exerciseUrl = (moduleId: string, lessonId: string, query?: string) =>
  `${lessonUrl(moduleId, lessonId)}/ejercicio${query ? `?${query}` : ""}`;
/** Perfil de un usuario (Comunidad; el admin ve además sus datos privados). Va por `?uid=` porque la exportación estática no tiene rutas por usuario. */
export const userProfileUrl = (uid: string) => `${ROUTES.userProfile}?uid=${encodeURIComponent(uid)}`;
