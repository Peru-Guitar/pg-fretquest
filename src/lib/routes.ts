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
};

/** Slug del módulo en la URL. */
const MODULE_SLUGS: Record<string, string> = {
  recommendations: "recomendaciones",
  fingering: "digitacion",
  arpeggios: "arpegios",
  "alternate-picking": "pua-alternada",
  "economy-picking": "economy-picking",
  scales: "escalas",
  "bending-vibrato": "bending-y-vibrato",
  legato: "legato",
  "sweep-picking": "sweep-picking",
  tapping: "tapping",
  "licks-phrasing": "estudios",
};

/** «Arpegios Maj7» → «arpegios-maj7». */
export const slugify = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Slugs de lección a partir del título; si dos lecciones de un módulo se llamaran igual, se numeran.
const lessonSlugs = new Map<string, string>();
const lessonsBySlug = new Map<string, string>();
for (const course of courses) {
  const used = new Set<string>();
  for (const lesson of course.lessons) {
    let slug = slugify(lesson.title) || lesson.id;
    for (let n = 2; used.has(slug); n++) slug = `${slugify(lesson.title)}-${n}`;
    used.add(slug);
    lessonSlugs.set(lesson.id, slug);
    lessonsBySlug.set(`${course.id}/${slug}`, lesson.id);
  }
}

export const moduleSlug = (moduleId: string) => MODULE_SLUGS[moduleId] ?? moduleId;
export const lessonSlug = (lessonId: string) => lessonSlugs.get(lessonId) ?? lessonId;

/** Del slug de la URL al id interno (acepta también el id, por los enlaces antiguos). */
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
/** Sala de práctica de un ejercicio (o del módulo, si no se indica). `query`: «sesion», «rutina=warmup»… */
export const practiceUrl = (moduleId: string, lessonId?: string, query?: string) =>
  `/practicar/${moduleSlug(moduleId)}${lessonId ? `/${lessonSlug(lessonId)}` : ""}${query ? `?${query}` : ""}`;

/** Ruta antigua (inglés, con ?exercise=) → ruta nueva. Para los enlaces ya compartidos. */
export function legacyRoute(pathname: string, search: URLSearchParams): string | null {
  const parts = pathname.split("/").filter(Boolean);
  const simple: Record<string, string> = {
    train: ROUTES.exercises, exercises: ROUTES.exercises, learn: ROUTES.exercises, plan: ROUTES.plan, account: ROUTES.account,
    community: ROUTES.community, login: ROUTES.login, guide: ROUTES.guide, about: ROUTES.about, tools: ROUTES.tools,
  };
  if (parts[0] === "tools" && parts[1] === "tuner") return ROUTES.tuner;
  if (parts[0] === "tools" && parts[1] === "metronome") return ROUTES.metronome;
  if (parts.length === 1 && simple[parts[0]]) return simple[parts[0]];
  if (parts[0] === "modules" && parts[1]) return parts[2] ? lessonUrl(parts[1], parts[2]) : moduleUrl(parts[1]);
  if (parts[0] === "practice" && parts[1]) {
    const exercise = search.get("exercise") ?? search.get("lesson") ?? undefined;
    const query = [search.has("session") ? "sesion" : "", search.get("routine") ? `rutina=${search.get("routine")}` : ""].filter(Boolean).join("&");
    return practiceUrl(parts[1], exercise, query || undefined);
  }
  return null;
}
