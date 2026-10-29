import type { PatternNote } from '@/lib/audio/practiceRound';

/**
 * Ritmo de la tablatura (como en Guitar Pro): plica en cada nota, barras según la figura (1 = corchea, 2 = semicorchea)
 * y corchete con «3» en los tresillos. Sale de la duración de cada nota (`beats`, o la figura del estudio).
 */
export type RhythmMark = {
    /** Barras de la nota: 0 = negra o más larga, 1 = corchea, 2 = semicorchea. */
    beams: number;
    /** Barras que la unen con la nota anterior (0 = empieza un grupo). */
    joined: number;
    /** Tresillo: `joined` si el corchete viene de la nota anterior; `label` en la nota del medio, que lleva el «3». */
    tuplet?: { joined: boolean; label: boolean };
};

const EPSILON = 1e-6;
// Tresillo: un tercio de una figura binaria (1/3 = tresillo de corchea, 1/6 = de semicorchea). Una nota larga sostenida no cuenta.
const binary = (value: number) => Math.abs(Math.log2(value) - Math.round(Math.log2(value))) < EPSILON;
const isTriplet = (beats: number) => beats < 1 && !binary(beats) && binary(beats * 3);
const beamsOf = (beats: number) => beats <= 0.25 + EPSILON ? 2 : beats <= 0.5 + EPSILON ? 1 : 0;

/** Marca de ritmo de cada nota. Los grupos se cortan en cada pulso, o en cada medio pulso en los tresillos de semicorchea. */
export function rhythmOf(pattern: PatternNote[], notesPerBeat: number): RhythmMark[] {
    let position = 0;
    const notes = pattern.map(note => {
        const beats = note.beats ?? 1 / notesPerBeat;
        const triplet = isTriplet(beats);
        const span = triplet && beats < 1 / 3 - EPSILON ? 0.5 : 1;
        const group = `${span}:${Math.floor((position + EPSILON) / span)}:${triplet}`;
        position += beats;
        return { beams: beamsOf(beats), group, triplet };
    });
    return notes.map((note, index) => {
        const previous = notes[index - 1];
        const sameGroup = previous?.group === note.group;
        const mark: RhythmMark = { beams: note.beams, joined: sameGroup && note.beams && previous.beams ? Math.min(note.beams, previous.beams) : 0 };
        if (note.triplet) {
            let first = index;
            while (notes[first - 1]?.group === note.group) first--;
            let last = index;
            while (notes[last + 1]?.group === note.group) last++;
            mark.tuplet = { joined: sameGroup, label: index === Math.floor((first + last) / 2) };
        }
        return mark;
    });
}

/** Resumen para la ficha: la figura si la lección usa una sola, «Ritmo mixto» si mezcla (la nota final no cuenta). */
export function rhythmSummary(pattern: PatternNote[], label: string, notesPerBeat: number): string {
    const durations = new Set(pattern.slice(0, -1).map(note => Math.round((note.beats ?? 1 / notesPerBeat) * 1e4)));
    return durations.size > 1 ? 'Ritmo mixto' : label;
}
