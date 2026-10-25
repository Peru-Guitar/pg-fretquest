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
  'michael-romeo': { id: 'michael-romeo', name: 'Michael Romeo', note: 'Guitarrista estadounidense de Symphony X, un referente de la técnica y del uso magistral del tapping.' },
  'vinnie-moore': { id: 'vinnie-moore', name: 'Vinnie Moore', note: 'Guitarrista estadounidense del shred neoclásico, conocido por su púa alternada precisa.' },
};

export const artistImage = (id: string) => `/images/artists/${id}.webp`;

/** Agrupa lecciones por artista y categoría (en el orden en que aparecen); las que no tienen ninguno van juntas con `artist: null`. */
export function groupByArtist<T extends { artist?: string; category?: string }>(lessons: T[]) {
    const groups: { artist: string | null; category: string | null; lessons: T[] }[] = [];
    for (const lesson of lessons) {
        const artist = lesson.artist ?? null;
        const category = lesson.category ?? null;
        const group = groups.find(item => item.artist === artist && item.category === category);
        if (group) group.lessons.push(lesson); else groups.push({ artist, category, lessons: [lesson] });
    }
    return groups;
}
