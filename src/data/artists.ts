import { slugify } from '@/lib/routes';

/**
 * Artistas con ejercicios propios en Fret Quest. Cuando un patrón es de un guitarrista destacado,
 * se le da el crédito con su nombre (y su foto) para reconocer su autoría.
 * La foto va en `public/images/artists/{id}.webp` (cuadrada, ~400×400); si no existe, se ven sus iniciales.
 */
export type Artist = { id: string; name: string; note: string };

export const artists: Record<string, Artist> = {
  'yngwie-malmsteen': { id: 'yngwie-malmsteen', name: 'Yngwie Malmsteen', note: 'Guitarrista sueco, referente del metal neoclásico y del sweep picking.' },
  'jason-becker': { id: 'jason-becker', name: 'Jason Becker', note: 'Guitarrista estadounidense del shred neoclásico, famoso por su sweep picking y sus arpegios.' },
  'paul-gilbert': { id: 'paul-gilbert', name: 'Paul Gilbert', note: 'Guitarrista estadounidense de Racer X y Mr. Big, referente de la púa alternada y del string skipping.' },
  'michael-romeo': { id: 'michael-romeo', name: 'Michael Romeo', note: 'Guitarrista estadounidense de Symphony X, un referente de los pasajes a gran velocidad y del manejo del tapping.' },
  'greg-howe': { id: 'greg-howe', name: 'Greg Howe', note: 'Guitarrista estadounidense de fusión y shred, referente del legato, el tapping y los arpegios a gran velocidad.' },
  'frank-gambale': { id: 'frank-gambale', name: 'Frank Gambale', note: 'Guitarrista australiano de jazz fusión, creador y referente del economy picking (sweep picking aplicado a escalas).' },
  'vinnie-moore': { id: 'vinnie-moore', name: 'Vinnie Moore', note: 'Guitarrista estadounidense del shred neoclásico, conocido por su púa alternada precisa.' },
};

export const artistImage = (id: string) => `/images/artists/${id}.webp`;

/** Agrupa lecciones por artista y categoría (en el orden en que aparecen); las que no tienen ninguno van juntas con `artist: null`. */
const DIFFICULTY_RANK: Record<string, number> = { base: 0, intermedio: 1, avanzado: 2, experto: 3 };
const easiest = (lessons: { difficulty?: string }[]) => Math.min(...lessons.map(lesson => DIFFICULTY_RANK[lesson.difficulty ?? ''] ?? 99));

/** Agrupa por artista y subcategoría. Los grupos van de más fácil a más difícil (por su lección más fácil); en empate, en el orden de los datos. */
export function groupByArtist<T extends { artist?: string; category?: string; difficulty?: string }>(lessons: T[]) {
    const groups: { artist: string | null; category: string | null; lessons: T[] }[] = [];
    for (const lesson of lessons) {
        const artist = lesson.artist ?? null;
        const category = lesson.category ?? null;
        const group = groups.find(item => item.artist === artist && item.category === category);
        if (group) group.lessons.push(lesson); else groups.push({ artist, category, lessons: [lesson] });
    }
    return groups.sort((a, b) => easiest(a.lessons) - easiest(b.lessons));
}

/**
 * Grupos de la página de un módulo, con el slug que usa cada pestaña en el hash. Hay pestañas solo cuando la lista se hace
 * larga: más de 12 lecciones repartidas en al menos 2 grupos.
 */
export function moduleGroups<T extends { id: string; type: string; artist?: string; category?: string; difficulty?: string }>(lessons: T[]) {
    const groups = groupByArtist(lessons.map(lesson => ({ ...lesson, artist: lesson.type === 'practice' ? lesson.artist : undefined, category: lesson.type === 'practice' ? lesson.category : undefined })));
    const label = (group: typeof groups[number]) => {
        const text = group.artist ? artists[group.artist]?.name ?? group.artist : group.category?.replace(/^Modos de la /, '') ?? 'De la comunidad';
        return text.charAt(0).toLocaleUpperCase('es') + text.slice(1);
    };
    return { groups, labels: groups.map(label), slugs: groups.map(group => slugify(label(group))), tabbed: groups.length > 1 && lessons.length > 12 };
}

/** Hash de la pestaña donde vive la lección («#horizontales»), o '' si el módulo no tiene pestañas. */
export function lessonTabHash(lessons: Parameters<typeof moduleGroups>[0], lessonId: string) {
    const { groups, slugs, tabbed } = moduleGroups(lessons);
    const index = groups.findIndex(group => group.lessons.some(lesson => lesson.id === lessonId));
    return tabbed && index >= 0 ? `#${slugs[index]}` : '';
}
