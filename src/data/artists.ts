/**
 * Artistas con ejercicios propios en Fret Quest. Cuando un patrón es de un guitarrista destacado,
 * se le da el crédito con su nombre (y su foto) para reconocer su autoría.
 * La foto va en `public/images/artists/{id}.webp` (cuadrada, ~400×400); si no existe, se ven sus iniciales.
 */
/** `photoCredit`: autor y licencia de la foto (p. ej. «Foto: Nombre · CC BY-SA 4.0»), obligatorio si la licencia lo pide. */
export type Artist = { id: string; name: string; note: string; photoCredit?: string };

export const artists: Record<string, Artist> = {
  'yngwie-malmsteen': { id: 'yngwie-malmsteen', name: 'Yngwie Malmsteen', note: 'Guitarrista sueco, referente del metal neoclásico y del sweep picking.' },
};

export const artistImage = (id: string) => `/images/artists/${id}.webp`;

/** Agrupa lecciones por artista (en el orden en que aparecen); las que no tienen artista van juntas con `artist: null`. */
export function groupByArtist<T extends { artist?: string }>(lessons: T[]) {
    const groups: { artist: string | null; lessons: T[] }[] = [];
    for (const lesson of lessons) {
        const artist = lesson.artist ?? null;
        const group = groups.find(item => item.artist === artist);
        if (group) group.lessons.push(lesson); else groups.push({ artist, lessons: [lesson] });
    }
    return groups;
}
