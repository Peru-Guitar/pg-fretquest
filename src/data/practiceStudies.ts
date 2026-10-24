import type { PatternNote } from '@/lib/audio/practiceRound';

export type Figure = 'negras' | 'corcheas' | 'tresillos' | 'semicorcheas' | 'sextillos';

/** Notas por pulso y nombre visible de cada figura. */
export const FIGURES: Record<Figure, { notesPerBeat: number; label: string; perBeat: string }> = {
    negras: { notesPerBeat: 1, label: 'Negras · 1 nota por pulso', perBeat: 'Una nota por pulso' },
    corcheas: { notesPerBeat: 2, label: 'Corcheas · 2 notas por pulso', perBeat: 'Dos notas por pulso' },
    tresillos: { notesPerBeat: 3, label: 'Tresillos · 3 notas por pulso', perBeat: 'Tres notas por pulso' },
    semicorcheas: { notesPerBeat: 4, label: 'Semicorcheas · 4 notas por pulso', perBeat: 'Cuatro notas por pulso' },
    sextillos: { notesPerBeat: 6, label: 'Sextillos · 6 notas por pulso', perBeat: 'Seis notas por pulso' },
};

export type PracticeStudy = {
    description: string;
    notation?: string;
    goal: string;
    steps: string[];
    mistakes: string[];
    criterion: string;
    /** Notas por fila de la tablatura (16 por defecto). */
    perRow?: number;
    /** Figura rítmica de la tablatura: cuántas notas suenan por pulso. */
    figure: Figure;
    /**
     * Cómo se atacan las notas: `alternate` (por defecto) alterna ⊓ V nota a nota;
     * `legato` (arpegios) usa púa solo al cambiar de cuerda (⊓ hacia la aguda, V hacia la grave)
     * y liga en la misma cuerda: hammer-on al subir de traste, pull-off al bajar.
     */
    picking?: 'alternate' | 'legato';
    /** Desde esta nota (índice del patrón) se usa la técnica de arpegio (`legato`), p. ej. un sweep al final de un lick. */
    legatoFrom?: number;
    /** Autor del patrón cuando es de un guitarrista destacado (id de `data/artists`): se le da el crédito. */
    artist?: string;
    /** Velocidad inicial del metrónomo (100 BPM por defecto). */
    bpm?: number;
    pattern: PatternNote[];
    /** Partes con título (se numeran solas); cada una empieza en una fila nueva de la tablatura. Sin partes, el patrón se reparte de corrido. */
    sections?: { title: string; pattern: PatternNote[] }[];
};
// Cromático de sexta a primera cuerda y de vuelta, con el índice en el traste `position`.
// `order` son los trastes relativos a la posición (1 = la posición) en el orden en que se tocan en cada cuerda: 1–2–3–4, 4–3–2–1, 1–3–5–3–5…
const chromaticAt = (position: number, order = [1, 2, 3, 4]): PatternNote[] => {
    const fingers = (string: number) => order.map(fret => ({ string, fret: position + fret - 1 }));
    // La vuelta empieza en la segunda cuerda: la primera no se repite al dar la vuelta.
    return [...[6, 5, 4, 3, 2, 1].flatMap(fingers), ...[2, 3, 4, 5, 6].flatMap(fingers)];
};
const chromaticPositions: [string, number][] = [['Desde el primer traste', 1], ['Desde el quinto traste', 5], ['Desde el séptimo traste', 7], ['Desde el traste 12', 12]];
// Arpegios de séptima (guía «No más arpegios aburridos» de peruguitar.com): una línea por cuerda tocada, «cuerda:trastes».
// Todos en corcheas, 16 notas (dos compases de 4/4), sobre la escala mayor de C.
const tab = (text: string): PatternNote[] => text.trim().split('\n').flatMap(line => {
    const [string, frets] = line.trim().split(':');
    return frets.split('-').map(fret => ({ string: Number(string), fret: Number(fret) }));
});
const ARPEGGIOS = {
    cmaj7: tab(`5:3-7\n4:5\n3:4-5\n2:5\n1:3-7-3\n2:5\n3:5-4\n4:5\n5:7-3-7`),
    fmaj7: tab(`5:8-12\n4:10\n3:9-10\n2:10\n1:8-12-8\n2:10\n3:10-9\n4:10\n5:12-8-12`),
    dm7: tab(`5:5-8\n4:7\n3:5-7\n2:6\n1:5-8-5\n2:6\n3:7-5\n4:7\n5:8-5-8`),
    em7: tab(`5:7-10\n4:9\n3:7-9\n2:8\n1:7-10-7\n2:8\n3:9-7\n4:9\n5:10-7-10`),
    am7: tab(`5:12-15\n4:14\n3:12-14\n2:13\n1:12-15-12\n2:13\n3:14-12\n4:14\n5:15-12-15`),
    g7: tab(`5:10-14\n4:12\n3:10-12\n2:12\n1:10-15-10\n2:12\n3:12-10\n4:12\n5:14-10-14`),
    g7ii: tab(`5:10\n4:9-12\n3:10\n2:8-12\n1:10\n2:12-8\n3:10\n4:12-9\n5:10\n4:12-9\n5:10`),
    bm7b5: tab(`5:2-5\n4:3\n3:2-4\n2:3\n1:1-5-1\n2:3\n3:4-2\n4:3\n5:5-2-5`),
    bm7b5d: tab(`5:5-8\n4:7\n3:4-7\n2:6\n1:5-7-5\n2:6\n3:7-4\n4:7\n5:8-5-8`),
    // Arpegios modales: la cuatriada de cada grado más la tensión que define su modo.
    dm13: tab(`5:5-8\n4:7\n3:4-7\n2:6\n1:5-7-5\n2:6\n3:7-4\n4:7\n5:8-5-8`),
    em7b9: tab(`5:7-10\n4:9\n3:7-9\n2:6-8\n1:7-9-7\n2:8-6\n3:9-7\n4:9\n5:10`),
    fmaj7s11: tab(`5:8-12\n4:10\n3:9-10\n2:12\n1:8-12-8\n2:12\n3:10-9\n4:10\n5:12-8-12`),
};
// Arpegios modales (capítulo «Arpegios modales» de la guía): uno por grado de la escala mayor de C.
// `fromSeventh`: el arpegio es el mismo de los arpegios de séptima, sin tensión añadida (se aclara en la lección).
const MODAL_ARPEGGIOS: { id: string; mode: string; degree: string; chord: string; formula: string; color: string; pattern: PatternNote[]; fromSeventh?: string }[] = [
    { id: 'ionian', mode: 'jónico', degree: 'I', chord: 'CMaj7', formula: '1 – 3 – 5 – 7', color: 'El modo jónico no tiene ninguna tensión específica, así que se usa el mismo arpegio Maj7.', pattern: ARPEGGIOS.cmaj7, fromSeventh: 'Arpegios Maj7' },
    { id: 'dorian', mode: 'dórico', degree: 'II', chord: 'Dm13', formula: '1 – b3 – 5 – b7 – 13', color: 'El dórico se caracteriza por la sexta, que aquí se convierte en trecena: un acorde menor 13.', pattern: ARPEGGIOS.dm13 },
    { id: 'phrygian', mode: 'frigio', degree: 'III', chord: 'Em7(b9)', formula: '1 – b3 – 5 – b7 – b9', color: 'El frigio se caracteriza por la segunda menor, que se agrega como tensión b9.', pattern: ARPEGGIOS.em7b9 },
    { id: 'lydian', mode: 'lidio', degree: 'IV', chord: 'FMaj7(#11)', formula: '1 – 3 – 5 – 7 – #11', color: 'El lidio se caracteriza por la cuarta aumentada, que se agrega como tensión #11.', pattern: ARPEGGIOS.fmaj7s11 },
    { id: 'mixolydian', mode: 'mixolidio', degree: 'V', chord: 'G7', formula: '1 – 3 – 5 – b7', color: 'Como el jónico, es un arpegio que ya conoces: mayor y con la séptima menor.', pattern: ARPEGGIOS.g7, fromSeventh: 'Arpegio de dominante' },
    { id: 'aeolian', mode: 'eólico', degree: 'VI', chord: 'Am7', formula: '1 – b3 – 5 – b7', color: 'Es la relativa menor del primer grado: un arpegio menor 7 sin alteraciones ni tensiones.', pattern: ARPEGGIOS.am7, fromSeventh: 'Arpegios m7' },
    { id: 'locrian', mode: 'locrio', degree: 'VII', chord: 'Bm7b5', formula: '1 – b3 – b5 – b7', color: 'También lo conoces de los arpegios de séptima: su tensión característica es la quinta disminuida.', pattern: ARPEGGIOS.bm7b5, fromSeventh: 'Arpegio semidisminuido' },
];
export const MODAL_ARPEGGIO_LESSONS = MODAL_ARPEGGIOS.map(({ id, mode, chord }) => ({ id: `arpeggios-modal-${id}`, title: `Arpegio ${mode} · ${chord}` }));
const modalArpeggioStudy = ({ mode, degree, chord, formula, color, pattern, fromSeventh }: typeof MODAL_ARPEGGIOS[number]): PracticeStudy => ({
    description: fromSeventh
        ? `El arpegio del modo ${mode} (grado ${degree} de la escala mayor de C): ${chord}. Fórmula ${formula}. Es el mismo arpegio de séptima que ya practicaste, sin ninguna alteración.`
        : `El arpegio del modo ${mode} (grado ${degree} de la escala mayor de C): ${chord}. Fórmula ${formula}.`,
    notation: ARPEGGIO_TEXT,
    goal: fromSeventh
        ? `Escuchar el arpegio de séptima como el color del modo ${mode}: no se le suma ninguna tensión.`
        : `Escuchar el color del modo ${mode}: la cuatriada del grado más su intervalo característico.`,
    steps: [color, ...(fromSeventh ? [`Sin alteraciones: es exactamente el ${chord} de «${fromSeventh}», en los arpegios de séptima. Si ya lo dominas, úsalo para comparar su color con el de los modos que sí llevan tensión.`] : []), 'Sube desde la quinta cuerda hasta la primera y vuelve, una nota por corchea con el metrónomo.', 'Púa solo al cambiar de cuerda; en la misma cuerda liga con hammer-on y pull-off.', 'Toca el acorde antes y después del arpegio para tener su sonido en el oído.'],
    mistakes: ['Dejar sonar dos notas a la vez al cruzar de cuerda.', 'Perder la nota de la tensión: es la que da el color del modo.', 'Acelerar en la bajada.'],
    criterion: 'Cuando el arpegio suene parejo a una velocidad cómoda, sube el BPM. La meta de la guía es 160 BPM en corcheas.',
    figure: 'corcheas',
    bpm: 80,
    perRow: 16,
    picking: 'legato',
    ...withSections([{ title: `${chord} · ${mode} · grado ${degree}`, pattern }]),
});
const ARPEGGIO_TEXT = 'Escala mayor de C · Corcheas: dos compases de 4/4 por acorde · Púa solo al cambiar de cuerda (⊓ al subir, V al bajar) · En la misma cuerda: h hammer-on, p pull-off';

const withSections = (sections: { title: string; pattern: PatternNote[] }[]) => ({ sections, pattern: sections.flatMap(section => section.pattern) });

// Lick 1 de Yngwie Malmsteen: cada acorde es una célula de tres notas en una cuerda (aguda, grave, media, aguda, media, grave)
// tocada dos veces en sextillos. Alterna segunda y primera cuerda por el ciclo de cuartas de Bm armónica.
const sextuplet = (string: number, [high, low, middle]: number[]): PatternNote[] =>
    [high, low, middle, high, middle, low].map(fret => ({ string, fret }));
const chord = (string: number, frets: number[]) => [...sextuplet(string, frets), ...sextuplet(string, frets)];
// Arpegio de Bm en sweep desde 14/5: sube hasta 14/1 y vuelve a 14/5.
const bmSweepUp: PatternNote[] = [{ string: 5, fret: 14 }, { string: 4, fret: 12 }, { string: 3, fret: 11 }, { string: 2, fret: 12 }, { string: 1, fret: 10 }, { string: 1, fret: 14 }];
const bmSweep = [...bmSweepUp, ...bmSweepUp.slice(0, -1).reverse()];
// Lick de Vinnie Moore: Am natural de bajada, tres notas por cuerda. Baja de dos en dos cuerdas y vuelve a subir una
// (1-2, 3-4, 3-4, 5-6) para seguir la escala en la posición de abajo, y resuelve en A (5/6) con una negra.
const descent = (string: number, frets: number[]) => frets.map(fret => ({ string, fret }));
const vinnieDescent: PatternNote[] = [
    ...descent(1, [13, 12, 10]), ...descent(2, [13, 12, 10]),
    ...descent(3, [12, 10, 9]), ...descent(4, [12, 10, 9]),
    ...descent(3, [10, 9, 7]), ...descent(4, [10, 9, 7]),
    ...descent(5, [10, 8, 7]), ...descent(6, [10, 8, 7]),
    { string: 6, fret: 5, beats: 1 },
];
// Lick 2 de Yngwie Malmsteen: bajada estilo neoclásico en Em armónica en la primera cuerda. Cada célula de cuatro notas
// (nota, salto arriba, paso abajo, nota) baja por la escala; el D# (11) lleva de vuelta a E (12). Sigue un arpegio de
// D#dim7 (C A F# D#) que baja de 3 en 3 trastes: baja a la tercera cuerda, slide a 5/3, sube hasta 5/1, slide a 2/1,
// vuelve a bajar y termina en 5/2 (E) con una negra.
const dimCell = (fret: number): PatternNote[] => [{ string: 1, fret }, { string: 2, fret: fret + 2 }, { string: 3, fret: fret + 3 }, { string: 3, fret }];
const slideTo = (string: number, fret: number): PatternNote => ({ string, fret, slide: true });
const yngwieDescent: PatternNote[] = [
    ...[19, 22, 20, 19, 17, 20, 19, 17, 15, 19, 17, 15, 14, 17, 15, 14, 12, 15, 14, 12, 11, 12, 14, 11, 12].map(fret => ({ string: 1, fret })),
    ...dimCell(8),
    slideTo(3, 5), { string: 3, fret: 8 }, { string: 2, fret: 7 }, { string: 1, fret: 5 },
    slideTo(1, 2), ...dimCell(2).slice(1),
    { string: 2, fret: 5, beats: 1 },
];
const yngwieBars: PatternNote[][] = [
    [...chord(2, [15, 12, 14]), ...chord(1, [15, 12, 14])],
    [...chord(2, [14, 10, 12]), ...chord(1, [14, 10, 12])],
    [...chord(2, [12, 8, 10]), ...chord(1, [12, 8, 10])],
    [...chord(2, [11, 7, 9]), { string: 2, fret: 12 }, { string: 2, fret: 11 }, { string: 2, fret: 12 }, { string: 3, fret: 11 }, { string: 4, fret: 12 }, ...bmSweep],
];

// Pentatónica de Gm (G Bb C D F): dos notas por cuerda en cada posición, de la sexta a la primera cuerda.
const PENTATONIC_G = [
    [3, 6, 3, 5, 3, 5, 3, 5, 3, 6, 3, 6],
    [6, 8, 5, 8, 5, 8, 5, 7, 6, 8, 6, 8],
    [8, 10, 8, 10, 8, 10, 7, 10, 8, 11, 8, 10],
    [10, 13, 10, 13, 10, 12, 10, 12, 11, 13, 10, 13],
    [13, 15, 13, 15, 12, 15, 12, 15, 13, 15, 13, 15],
];
// Grupos de tres cuerdas: tocas tres cuerdas, regresas dos y vuelves a avanzar (6-5-4, 5-4-3, 4-3-2, 3-2-1).
// La bajada repite la idea desde la primera cuerda (1-2-3, 2-3-4, 3-4-5, 4-5-6) con los trastes al revés.
const pentatonicGroups = (frets: number[]): PatternNote[] => {
    const up = (string: number) => [{ string, fret: frets[(6 - string) * 2] }, { string, fret: frets[(6 - string) * 2 + 1] }];
    const down = (string: number) => up(string).reverse();
    const ascending = [6, 5, 4, 3].flatMap(first => [first, first - 1, first - 2].flatMap(up));
    const descending = [1, 2, 3, 4].flatMap(first => [first, first + 1, first + 2].flatMap(down));
    return [...ascending, ...descending];
};
const pentatonicStudy = (position: number): PracticeStudy => {
    const frets = PENTATONIC_G[position - 1];
    return {
        description: `Posición ${position} de la pentatónica de Gm (trastes ${Math.min(...frets)}–${Math.max(...frets)}) en grupos de tres cuerdas: tocas tres cuerdas, regresas dos y vuelves a avanzar.`,
        notation: 'Pentatónica de Gm (G Bb C D F) · Tresillos: un grupo de tres cuerdas cada dos pulsos · Púa alternada continua',
        goal: 'Salir de tocar la escala de arriba abajo. El patrón obliga a ver la posición por bloques de cuerdas y a cambiar de dirección sin perder el pulso.',
        steps: [
            `Aprende primero la posición ${position}: dos notas por cuerda, de la sexta a la primera.`,
            'Subida: toca la sexta, quinta y cuarta cuerda; regresa a la quinta y toca quinta, cuarta y tercera. Sigue así hasta llegar a la primera cuerda.',
            'Bajada: lo mismo al revés. Primera, segunda y tercera; regresa a la segunda y toca segunda, tercera y cuarta, hasta terminar en la sexta.',
            'Cada grupo son seis notas en tresillos: dos pulsos por grupo. Púa alternada continua, sin reiniciar la púa en cada grupo.',
        ],
        mistakes: ['Perder el lugar al regresar dos cuerdas y repetir un grupo.', 'Acentuar la primera nota de cada grupo.', 'Dejar sonar las cuerdas al cambiar de dirección.'],
        criterion: 'Toca la subida y la bajada sin detenerte ni dudar en los regresos. Sube el BPM cuando todos los grupos suenen parejos.',
        figure: 'tresillos',
        bpm: 60,
        perRow: 12,
        pattern: pentatonicGroups(frets),
    };
};
/** Nota con la que empieza cada posición en la sexta cuerda (para el título de la lección). */
export const PENTATONIC_G_START = ["G", "B♭", "C", "D", "F"];
// Sweep en grupos de 5 notas: cada cuerda tiene las dos notas de la posición y la de arriba (la segunda de la posición
// siguiente; la 5 la toma de la 1 una octava arriba). Cada grupo barre tres cuerdas, grave (primera y de arriba),
// media (segunda) y aguda (primera y de arriba), y avanza una cuerda: 6-5-4, 5-4-3, 4-3-2, 3-2-1. Baja por el mismo camino.
const pentatonicSweepUp = (position: number): PatternNote[] => {
    const frets = PENTATONIC_G[position - 1];
    const next = position < 5 ? PENTATONIC_G[position] : PENTATONIC_G[0].map(fret => fret + 12);
    const outer = (string: number) => [frets[(6 - string) * 2], next[(6 - string) * 2 + 1]].map(fret => ({ string, fret }));
    return [6, 5, 4, 3].flatMap(low => [...outer(low), { string: low - 1, fret: frets[(7 - low) * 2 + 1] }, ...outer(low - 2)]);
};
const pentatonicSweepStudy = (position: number): PracticeStudy => {
    const up = pentatonicSweepUp(position);
    // La bajada no repite la última nota de arriba y termina en la primera de la sexta cuerda, más larga.
    const down = [...up].reverse().slice(1).map((note, index, all) => index === all.length - 1 ? { ...note, beats: 2.5 } : note);
    const frets = up.map(note => note.fret);
    const [low, high] = [Math.min(...frets), Math.max(...frets)];
    const [first, , middle, , last] = up;
    return {
        description: `Patrón extendido de la pentatónica de Gm: une la posición ${position} con la ${position < 5 ? position + 1 : 1} y cubre los trastes ${low}–${high}. Se toca en sweep, en grupos de cinco notas sobre tres cuerdas, subiendo de la sexta a la primera y bajando por el mismo camino.`,
        notation: 'Pentatónica de Gm (G Bb C D F) · Semicorcheas · Sweep: púa solo al cambiar de cuerda, ligado en la misma cuerda',
        goal: 'Salir de la caja de una sola posición: estirar la mano para unir dos posiciones de la escala y barrer tres cuerdas en cada grupo, con la púa en una sola dirección al cambiar de cuerda y las notas de la misma cuerda ligadas.',
        steps: [
            `La mano se queda en los trastes ${low}–${high}: índice en el ${low} y meñique en el ${high}; abre la mano en vez de desplazarla.`,
            `Cada grupo son cinco notas: dos en la cuerda grave, una en la del medio y dos en la aguda (el primero: ${first.fret}–${up[1].fret} en la sexta, ${middle.fret} en la quinta, ${up[3].fret}–${last.fret} en la cuarta).`,
            'Al terminar un grupo, regresa una cuerda y empieza el siguiente: 5–4–3, 4–3–2, 3–2–1.',
            'Subiendo, la púa va hacia abajo (⊓) en cada cambio de cuerda; las dos notas de la misma cuerda van con hammer-on.',
            `Arriba da la vuelta en el ${up[up.length - 2].fret} de la primera cuerda y baja por el mismo camino con púa hacia arriba (V) y pull-offs, hasta el ${first.fret} de la sexta.`,
        ],
        mistakes: ['Mover la mano en lugar de abrirla en las notas de los extremos.', 'Dejar sonar las notas de un grupo encima del siguiente: apaga con la mano izquierda al levantar cada dedo.', 'Atacar con púa las notas ligadas.'],
        criterion: 'Sube y baja sin pausas entre grupos y con todas las notas al mismo volumen. Sube el BPM solo cuando el sweep no suene a acorde.',
        figure: 'semicorcheas',
        picking: 'legato',
        bpm: 60,
        perRow: 16,
        pattern: [...up, ...down],
    };
};

// Modos de la escala mayor de C (patrón del curso de erpskool, «Escala de Do mayor»): todos con las notas de C mayor,
// cada uno desde su grado (D dórico, E frigio…). Se agrupan por su tercera: los mayores en «Escala mayor» y los menores
// en «Escala menor», junto a la menor natural (A eólico).
// Tres notas por cuerda desde la tónica en la quinta cuerda, dos octavas; cada parte sube una cuerda más que la anterior
// y regresa. La última baja hasta la sexta cuerda, vuelve a subir y termina en la tónica.
const OPEN_MIDI = [64, 59, 55, 50, 45, 40];
const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const MAJOR_PCS = [0, 2, 4, 5, 7, 9, 11];
/** Modos en el orden en que se presentan: id de lección, grado de C mayor del que salen y grupo. */
export const SCALE_MODES = [
    { id: 'scales-01', degree: 0, mode: 'jónico', group: 'Escala mayor', color: 'Es la escala mayor misma: brillante y estable.' },
    { id: 'scales-04', degree: 3, mode: 'lidio', group: 'Escala mayor', color: 'Mayor con la cuarta aumentada (#4): suena abierto y suspendido.' },
    { id: 'scales-05', degree: 4, mode: 'mixolidio', group: 'Escala mayor', color: 'Mayor con la séptima menor (b7): el sonido del acorde de dominante.' },
    { id: 'scales-06', degree: 5, mode: 'eólico', group: 'Escala menor', color: 'Es la escala menor natural: la relativa menor de C mayor.' },
    { id: 'scales-02', degree: 1, mode: 'dórico', group: 'Escala menor', color: 'Menor con la sexta mayor: un color menor más luminoso.' },
    { id: 'scales-03', degree: 2, mode: 'frigio', group: 'Escala menor', color: 'Menor con la segunda menor (b2): oscuro, de sabor español.' },
    { id: 'scales-07', degree: 6, mode: 'locrio', group: 'Escala menor', color: 'Con la segunda menor y la quinta disminuida (b2, b5): inestable y tenso.' },
] as const;
const ORDINALS = ['primer', 'segundo', 'tercer', 'cuarto', 'quinto', 'sexto', 'séptimo'];
/** Tónica de cada modo: el grado de C mayor del que sale. */
export const modeRoot = (degree: number) => NOTE_NAMES[degree];
const note = (string: number, midi: number): PatternNote => ({ string, fret: midi - OPEN_MIDI[string - 1] });
const modeStudy = ({ degree, mode, color }: typeof SCALE_MODES[number]): PracticeStudy => {
    const root = modeRoot(degree);
    const notes = [0, 1, 2, 3, 4, 5, 6].map(step => NOTE_NAMES[(degree + step) % 7]);
    // La tónica va en la quinta cuerda entre los trastes 1 y 12.
    const rootMidi = 45 + (((MAJOR_PCS[degree] - 9 + 12) % 12) || 12);
    const scale = (offset: number) => { const index = degree + offset; return rootMidi - MAJOR_PCS[degree] + MAJOR_PCS[((index % 7) + 7) % 7] + Math.floor(index / 7) * 12; };
    const up = Array.from({ length: 15 }, (_, index) => note(5 - Math.floor(index / 3), scale(index)));
    const below = [-1, -2, -3].map(offset => note(6, scale(offset)));
    const part = (strings: number) => [...up.slice(0, strings * 3), ...up.slice(1, strings * 3 - 1).reverse()];
    const start = up[0].fret;
    return {
        description: `${root} ${mode}: el ${ORDINALS[degree]} modo de la escala mayor de C (mismas notas, empezando en ${root}), con un patrón de tres notas por cuerda desde ${root} en el traste ${start} de la quinta cuerda. ${color}`,
        notation: `${root} ${mode} (${notes.join(' ')}) · Corcheas · Púa alternada`,
        goal: `Conocer las posiciones de ${root} ${mode} en el mástil, escuchar su color frente a los otros modos de C mayor y mejorar el picking.`,
        steps: [
            `Antes del patrón, toca la escala completa: de ${root} en el traste ${start} de la quinta cuerda a ${root} en el traste ${up[14].fret} de la primera, dos octavas más arriba.`,
            `El patrón tiene cuatro partes. Cada una sale de ${root}, sube una cuerda más que la anterior y regresa hasta el traste ${up[1].fret} de la quinta cuerda.`,
            `En la cuarta parte sube hasta la primera cuerda, regresa por todas las notas hasta la sexta, vuelve a subir (${below[1].fret} y ${below[0].fret}) y termina en ${root}, en el traste ${start} de la quinta cuerda.`,
            'Al subir, mantén apoyados los dedos que ya pisaste; al bajar, levántalos uno a uno para que suene la nota anterior.',
            'Toca con púa alternada y silencia con la mano las cuerdas que ya no usas.',
        ],
        mistakes: ['Levantar los dedos al subir: se pierde el contacto con el mástil.', 'Dejar sonar las cuerdas que ya tocaste.', 'Correr antes de que el patrón se sienta fluido.'],
        criterion: 'Toca las cuatro partes de corrido, lento y sin pausas. Sube el BPM solo cuando todas las notas suenen limpias y parejas.',
        figure: 'corcheas',
        bpm: 60,
        ...withSections([
            { title: 'Hasta la cuarta cuerda', pattern: part(2) },
            { title: 'Hasta la tercera cuerda', pattern: part(3) },
            { title: 'Hasta la segunda cuerda', pattern: part(4) },
            { title: 'Hasta la primera cuerda y de vuelta', pattern: [...up, ...up.slice(0, 14).reverse(), ...below, below[1], below[0], up[0]] },
        ]),
    };
};

// Estudio de Jason Becker: arpegios de tres cuerdas en sweep con pull-off en la primera cuerda. Un compás por línea, «traste/cuerda».
const BECKER_BARS = [
    '12/1 10/1 12/2 11/3 12/2 10/1 12/1 10/1 12/2 11/3 12/2 10/1 12/1 10/1 12/2 10/1',
    '14/1 10/1 12/2 11/3 12/2 10/1 14/1 10/1 12/2 11/3 12/2 10/1 14/1 10/1 12/2 10/1',
    '12/1 10/1 12/2 11/3 12/2 10/1 12/1 10/1 12/2 11/3 12/2 10/1 12/1 10/1 12/2 10/1',
    '9/1 10/1 9/1 12/2 11/3 12/2 9/1 10/1 9/1 12/2 11/3 12/2 9/1 10/1 9/1 12/2 9/1',
    '14/1 10/1 12/2 11/3 12/2 10/1 19/1 14/1 15/2 16/3 15/2 14/1 19/1 14/1 15/2 14/1',
    '19/1 15/1 15/2 16/3 15/2 19/1 22/1 15/1 15/2 16/3 15/2 15/1 19/1 15/1 15/2 15/1',
    '17/1 15/1 15/2 14/3 15/2 15/1 17/1 15/1 15/2 14/3 15/2 15/1 17/1 15/1 15/2 15/1',
    '17/1 12/1 14/2 14/3 14/2 12/1 17/1 12/1 14/2 14/3 14/2 12/1 17/1 12/1 14/2 12/1',
    '15/1 12/1 14/2 14/3 14/2 12/1 15/1 12/1 14/2 14/3 12/3 14/4 16/5 14/4 12/3 14/3',
    '10/1 14/1 10/1 12/2 11/3 12/2 10/1 14/1 10/1 12/2 11/3 12/2 10/1 14/1 10/1 12/2 10/1',
    '14/1 12/1 12/2 11/3 12/2 12/1 14/1 12/1 12/2 11/3 12/2 12/1 14/1 12/1 12/2 12/1',
    '14/1 10/1 12/2 11/3 12/2 10/1 14/1 10/1 12/2 11/3 12/2 10/1 14/1 10/1 12/2 10/1',
    '16/1 13/1 15/2 16/3 15/2 13/1 19/1 16/1 18/2 19/3 18/2 16/1 22/1 19/1 21/2 19/1',
    '21/1 17/1 17/2 18/3 19/4 17/2 17/1 12/1 14/2 14/3 14/2 12/1 17/1 12/1 14/2 12/1',
    '15/1 12/1 14/2 15/3 12/3 14/4 12/1 9/1 11/2 12/3 9/3 11/4 14/2 11/2 12/3 11/2',
    '15/1 12/1 14/2 15/3 12/3 14/4 16/5 13/5 10/5 12/6 9/6 12/6 10/5 13/5 11/4 9/3 12/3 11/2',
];
const beckerBars = BECKER_BARS.map(bar => bar.split(' ').map(note => { const [fret, string] = note.split('/').map(Number); return { string, fret }; }));

export const practiceStudies: Record<string, PracticeStudy> = {
    ...Object.fromEntries(SCALE_MODES.map(mode => [mode.id, modeStudy(mode)])),
    'fingering-01': {
        description: 'Cromático clásico 1–2–3–4 en todas las cuerdas, de ida y de vuelta, en cuatro posiciones del mástil: trastes 1, 5, 7 y 12.',
        goal: 'Soltar los dedos. Cada posición se siente distinta: abajo los trastes están más separados y arriba más juntos, así que la mano tiene que adaptarse a cada zona.',
        steps: ['Dedos 1, 2, 3 y 4 = índice, medio, anular y meñique, un dedo por traste. En la primera posición van en los trastes 1, 2, 3 y 4.', 'Toca 1–2–3–4 en cada cuerda desde la sexta hasta la primera. De regreso, desde la primera hasta la sexta, toca igual 1–2–3–4.', 'Al terminar la vuelta, sube la mano: posición 5 (trastes 5–8), luego 7 (trastes 7–10) y finalmente 12 (trastes 12–15).', 'Púa alternada continua, una nota por clic. Elige una velocidad a la que puedas tocar todo limpio, no la más rápida.'],
        mistakes: ['Apretar de más en la primera posición, donde los trastes están más separados.', 'Amontonar los dedos en el traste 12, donde el espacio es menor.', 'Levantar mucho los dedos o mover toda la mano en cada nota.'],
        criterion: 'Recorre las cuatro posiciones sin pararte en los cambios y sin zumbidos. Sube la velocidad solo cuando todas suenen igual de limpias.',
        figure: 'negras',
        ...withSections(chromaticPositions.map(([title, position]) => ({ title, pattern: chromaticAt(position) }))),
    },
    'fingering-02': {
        description: 'El mismo recorrido del cromático 1–2–3–4, pero al revés: 4–3–2–1 en cada cuerda, de ida y de vuelta, en los trastes 1, 5, 7 y 12.',
        goal: 'No es lo mismo tocar empezando por el meñique que por el índice. Desarrolla fuerza y control en ambas posturas, hasta que el 4–3–2–1 suene tan parejo como el 1–2–3–4.',
        steps: ['Coloca los cuatro dedos antes de empezar: índice, medio, anular y meñique en los trastes 1, 2, 3 y 4.', 'Toca 4–3–2–1 en cada cuerda desde la sexta hasta la primera. De regreso, desde la primera hasta la sexta, toca igual 4–3–2–1.', 'Empezar por el meñique exige que el resto de dedos ya esté apoyado: al tocar el 4, los dedos 1, 2 y 3 esperan sobre sus trastes y se van soltando uno a uno.', 'Al terminar la vuelta, sube la mano: posición 5 (trastes 5–8), luego 7 (trastes 7–10) y finalmente 12 (trastes 12–15).', 'Púa alternada continua, una nota por clic. Elige una velocidad a la que todo suene limpio.'],
        mistakes: ['Que el meñique suene más débil o más corto que los demás dedos.', 'Levantar todos los dedos a la vez en lugar de soltarlos de uno en uno.', 'Tensar la mano para sostener la postura en la primera posición.'],
        criterion: 'Recorre las cuatro posiciones sin pararte y con el mismo volumen en las cuatro notas. Compara con el 1–2–3–4: cuando suenen igual, sube la velocidad.',
        figure: 'negras',
        ...withSections(chromaticPositions.map(([title, position]) => ({ title, pattern: chromaticAt(position, [4, 3, 2, 1]) }))),
    },
    'fingering-03': {
        description: 'Cromático con los dedos intercalados: 1–3–2–4 en cada cuerda, de ida y de vuelta, en los trastes 1, 5, 7 y 12.',
        goal: 'Romper el automatismo de tocar los dedos siempre en orden. Cada dedo tiene que moverse por su cuenta, sin arrastrar al de al lado.',
        steps: ['Un dedo por traste: índice, medio, anular y meñique en los trastes 1, 2, 3 y 4. El orden es 1–3–2–4: los números son dedos.', 'Toca 1–3–2–4 en cada cuerda desde la sexta hasta la primera. De regreso, desde la primera hasta la sexta, toca igual 1–3–2–4.', 'Al pasar del 3 al 2, deja el anular listo cerca de su traste; no lo levantes de más.', 'Al terminar la vuelta, sube la mano: posición 5 (trastes 5–8), luego 7 (trastes 7–10) y finalmente 12 (trastes 12–15).', 'Púa alternada continua, una nota por clic. Elige una velocidad a la que no se te cambie el orden de los dedos.'],
        mistakes: ['Convertir el patrón sin darte cuenta en 1–2–3–4.', 'Dejar un dedo apoyado por encima del traste que debe sonar.', 'Mover la mano entera para alcanzar el salto del 1 al 3.'],
        criterion: 'Recorre las cuatro posiciones sin corregir la digitación a mitad del patrón. Sube la velocidad solo cuando el orden te salga sin pensarlo.',
        figure: 'negras',
        ...withSections(chromaticPositions.map(([title, position]) => ({ title, pattern: chromaticAt(position, [1, 3, 2, 4]) }))),
    },
    'fingering-04': {
        description: 'El intercalado al revés: 4–2–3–1 en cada cuerda, de ida y de vuelta, en los trastes 1, 5, 7 y 12.',
        goal: 'Llevar la independencia de los dedos a la postura inversa. Empezar por el meñique y saltar entre dedos exige fuerza y control en toda la mano.',
        steps: ['Coloca los cuatro dedos antes de empezar: índice, medio, anular y meñique en los trastes 1, 2, 3 y 4. El orden es 4–2–3–1.', 'Toca 4–2–3–1 en cada cuerda desde la sexta hasta la primera. De regreso, desde la primera hasta la sexta, toca igual 4–2–3–1.', 'Al tocar el 4, los demás dedos esperan apoyados. Suelta solo lo necesario para que suene cada nota.', 'Al terminar la vuelta, sube la mano: posición 5 (trastes 5–8), luego 7 (trastes 7–10) y finalmente 12 (trastes 12–15).', 'Púa alternada continua, una nota por clic. Elige una velocidad a la que todo suene limpio.'],
        mistakes: ['Que el meñique suene más débil que los demás dedos.', 'Levantar todos los dedos a la vez en lugar de soltarlos según el orden.', 'Cambiar el patrón sin querer a 4–3–2–1.'],
        criterion: 'Recorre las cuatro posiciones con el mismo volumen en las cuatro notas. Compara con el 1–3–2–4: cuando suenen igual, sube la velocidad.',
        figure: 'negras',
        ...withSections(chromaticPositions.map(([title, position]) => ({ title, pattern: chromaticAt(position, [4, 2, 3, 1]) }))),
    },
    'fingering-05': {
        description: 'Estiramiento de la mano izquierda: trastes 1–3–5–3–5 en cada cuerda, de ida y de vuelta, en los trastes 1, 5, 7 y 12.',
        goal: 'Abrir la mano para cubrir cinco trastes sin moverla. En los primeros trastes la distancia es mayor, por eso cada posición exige un estiramiento distinto.',
        steps: ['Índice en el primer traste, dedo medio o anular en el tercero y meñique en el quinto. La mano no se desplaza: se abre.', 'Toca 1–3–5–3–5 en cada cuerda desde la sexta hasta la primera. De regreso, desde la primera hasta la sexta, toca igual 1–3–5–3–5.', 'Al terminar la vuelta, sube la mano: posición 5 (trastes 5–9), luego 7 (trastes 7–11) y finalmente 12 (trastes 12–16).', 'Púa alternada continua, una nota por clic. Ve despacio: el estiramiento se gana con constancia, no con fuerza.'],
        mistakes: ['Mover toda la mano para llegar al quinto traste en lugar de abrir los dedos.', 'Subir el hombro o apretar el pulgar para alcanzar la distancia.', 'Seguir tocando con dolor: si molesta, detente y empieza por la posición 12, donde los trastes están más juntos.'],
        criterion: 'Recorre las cuatro posiciones con las notas claras y sin tensión. Si la primera posición todavía no sale, practícala al final, cuando la mano ya esté caliente.',
        figure: 'negras',
        perRow: 15,
        ...withSections(chromaticPositions.map(([title, position]) => ({ title, pattern: chromaticAt(position, [1, 3, 5, 3, 5]) }))),
    },
    'arpeggios-maj7': {
        description: 'Los dos arpegios Maj7 de la escala mayor de C: CMaj7 (grado I) y FMaj7 (grado IV). Fórmula 1 – 3 – 5 – 7.',
        notation: ARPEGGIO_TEXT,
        goal: 'Interiorizar el color de la séptima mayor. El recorrido de los dedos es exactamente el mismo para CMaj7 y FMaj7: solo cambia el traste de partida.',
        steps: ['Al armonizar la escala mayor obtenemos dos acordes Maj7, en el primer y cuarto grado: CMaj7 y FMaj7.', 'La característica de ambos es la séptima mayor en su estructura. Fórmula: 1 – 3 – 5 – 7.', 'Sube desde la quinta cuerda hasta la primera y vuelve. Resolvemos en la tercera mayor y no en la tónica para no dejar un silencio en el compás.', 'Una nota por corchea, con el metrónomo. Toca cada arpegio limpio antes de pasar al siguiente.'],
        mistakes: ['Dejar sonar dos notas a la vez al cruzar de cuerda.', 'Mover la mano entera en lugar de estirar el meñique para la séptima.', 'Acelerar en la bajada.'],
        criterion: 'Cuando los dos arpegios suenen parejos a una velocidad cómoda, sube el BPM. La meta de la guía es 160 BPM en corcheas.',
        figure: 'corcheas',
        bpm: 80,
        perRow: 16,
        picking: 'legato',
        ...withSections([{ title: 'CMaj7 · grado I', pattern: ARPEGGIOS.cmaj7 }, { title: 'FMaj7 · grado IV', pattern: ARPEGGIOS.fmaj7 }]),
    },
    'arpeggios-m7': {
        description: 'Los tres arpegios m7 de la escala mayor de C: Dm7 (II), Em7 (III) y Am7 (VI). Fórmula 1 – b3 – 5 – b7.',
        notation: ARPEGGIO_TEXT,
        goal: 'Reconocer el color menor con séptima menor. Los tres arpegios usan el mismo recorrido de dedos: solo varía el traste.',
        steps: ['Al armonizar la escala mayor obtenemos tres acordes m7, en el segundo, tercer y sexto grado: Dm7, Em7 y Am7.', 'Su característica es la tercera menor y la séptima menor. Fórmula: 1 – b3 – 5 – b7.', 'Volvemos a resolver en la tercera, esta vez la tercera menor, para no dejar un silencio en el compás.', 'Una nota por corchea. Cambia de arpegio sin detenerte: es el mismo dibujo en otra posición.'],
        mistakes: ['Confundir el dibujo con el de Maj7 (la tercera y la séptima están un traste más abajo).', 'Perder el pulso al cambiar de posición entre arpegios.'],
        criterion: 'Sube el BPM cuando puedas encadenar los tres sin pausas y con todas las notas iguales.',
        figure: 'corcheas',
        bpm: 80,
        perRow: 16,
        picking: 'legato',
        ...withSections([{ title: 'Dm7 · grado II', pattern: ARPEGGIOS.dm7 }, { title: 'Em7 · grado III', pattern: ARPEGGIOS.em7 }, { title: 'Am7 · grado VI', pattern: ARPEGGIOS.am7 }]),
    },
    'arpeggios-dominant': {
        description: 'El arpegio de séptima de dominante de la escala mayor de C: G7 (grado V), en dos formas. Fórmula 1 – 3 – 5 – b7.',
        notation: ARPEGGIO_TEXT,
        goal: 'Escuchar la tensión del dominante: tercera mayor con séptima menor forman el tritono que pide resolver al primer grado.',
        steps: ['Al armonizar la escala mayor obtenemos un único acorde de séptima de dominante, en el quinto grado: G7.', 'Su característica es la tercera mayor junto a la séptima menor. Fórmula: 1 – 3 – 5 – b7.', 'La segunda parte es una variación de G7 para verlo de otra forma; para completar el compás se repiten las últimas notas.', 'Una nota por corchea. Escucha la tensión: es la que hace que la música avance.'],
        mistakes: ['Tocar la séptima mayor por costumbre de Maj7.', 'Perder el pulso en los saltos de cuerda de la variación.'],
        criterion: 'Sube el BPM cuando las dos formas suenen igual de limpias.',
        figure: 'corcheas',
        bpm: 80,
        perRow: 16,
        picking: 'legato',
        ...withSections([{ title: 'G7 · grado V', pattern: ARPEGGIOS.g7 }, { title: 'G7 · variación', pattern: ARPEGGIOS.g7ii }]),
    },
    'arpeggios-half-diminished': {
        description: 'El arpegio semidisminuido de la escala mayor de C: Bm7b5 (grado VII) y su primera inversión. Fórmula 1 – b3 – b5 – b7.',
        notation: ARPEGGIO_TEXT,
        goal: 'Dominar el color semidisminuido: tercera menor, quinta disminuida y séptima menor. La inversión amplía tu visión del mástil.',
        steps: ['Al armonizar la escala mayor obtenemos un único acorde m7b5, en el séptimo grado: Bm7b5.', 'Su característica es la tercera menor, la quinta disminuida y la séptima menor. Fórmula: 1 – b3 – b5 – b7.', 'La segunda parte es la primera inversión, Bm7b5/D: empieza desde la tercera.', 'Reto: encuentra tú las inversiones que faltan, desde la quinta o desde la séptima menor.'],
        mistakes: ['Tocar la quinta justa en lugar de la disminuida.', 'Tensar la mano en la posición baja del mástil.'],
        criterion: 'Sube el BPM cuando las dos formas salgan sin dudar en la quinta disminuida.',
        figure: 'corcheas',
        bpm: 80,
        perRow: 16,
        picking: 'legato',
        ...withSections([{ title: 'Bm7b5 · grado VII', pattern: ARPEGGIOS.bm7b5 }, { title: 'Bm7b5/D · primera inversión', pattern: ARPEGGIOS.bm7b5d }]),
    },
    'arpeggios-harmonized': {
        description: 'Los siete arpegios de séptima de la escala mayor de C, de corrido y sin pausas, hasta la octava: CMaj7, Dm7, Em7, FMaj7, G7, Am7, Bm7b5 y de nuevo CMaj7, subiendo por el mástil.',
        notation: ARPEGGIO_TEXT,
        goal: 'Encadenar la escala armonizada completa, de la tónica a su octava. Cada arpegio termina en la quinta cuerda y el siguiente empieza en la misma cuerda, uno o dos trastes más arriba: el cambio tiene que sonar continuo.',
        steps: ['El orden es el de la escala: I CMaj7, II Dm7, III Em7, IV FMaj7, V G7, VI Am7, VII Bm7b5 y cierra en la octava con CMaj7.', 'Todos usan el mismo recorrido: suben de la quinta a la primera cuerda, vuelven y resuelven en la tercera.', 'El paso de un arpegio al siguiente es corto y en la misma cuerda: prepara la mano mientras tocas las últimas notas.', 'Bm7b5 va una octava arriba (traste 14) para seguir subiendo sin saltos, y el CMaj7 final, en el traste 15.', 'Una nota por corchea, sin pausas entre acordes. Empieza lento: son 128 notas seguidas.'],
        mistakes: ['Detenerse o acentuar el primer tiempo de cada arpegio nuevo.', 'Perder la tercera o la séptima correcta al cambiar de tipo de acorde (mayor, menor, dominante, semidisminuido).', 'Tensar la mano en los trastes altos.'],
        criterion: 'Recorre los ocho arpegios sin cortes antes de subir el BPM. Si un cambio falla, practica solo ese par de arpegios.',
        figure: 'corcheas',
        bpm: 70,
        perRow: 16,
        picking: 'legato',
        ...withSections([
            { title: 'CMaj7 · I', pattern: ARPEGGIOS.cmaj7 },
            { title: 'Dm7 · II', pattern: ARPEGGIOS.dm7 },
            { title: 'Em7 · III', pattern: ARPEGGIOS.em7 },
            { title: 'FMaj7 · IV', pattern: ARPEGGIOS.fmaj7 },
            { title: 'G7 · V', pattern: ARPEGGIOS.g7 },
            { title: 'Am7 · VI', pattern: ARPEGGIOS.am7 },
            // Una octava arriba (traste 14): sigue la subida en lugar de saltar al traste 2.
            { title: 'Bm7b5 · VII', pattern: ARPEGGIOS.bm7b5.map(note => ({ ...note, fret: note.fret + 12 })) },
            // Cierra en la octava: CMaj7 doce trastes arriba (traste 15), dos trastes por debajo de donde termina Bm7b5.
            { title: 'CMaj7 · I (octava)', pattern: ARPEGGIOS.cmaj7.map(note => ({ ...note, fret: note.fret + 12 })) },
        ]),
    },
    'licks-phrasing-yngwie-01': {
        description: 'Un lick neoclásico de Yngwie Malmsteen en Bm: pequeños grupos de notas que recorren varios acordes y terminan con un arpegio en sweep.',
        notation: 'Metrónomo en negras · Púa alternada continua',
        goal: 'Que todas las notas suenen parejas y sin acentos raros mientras la mano cambia de cuerda y de posición.',
        steps: [
            'Escucha el ejercicio primero para tener el sonido en la cabeza.',
            'Sigue la tablatura: cada grupo de notas se repite dos veces antes de pasar al siguiente.',
            'Usa púa alternada en todo el lick, menos en el arpegio final: ahí la púa barre las cuerdas (⊓ al subir, V al bajar) y en la primera cuerda se liga con hammer-on y pull-off (h y p).',
            'Mantén la mano relajada en los cambios de posición; deja que el brazo la lleve.',
        ],
        mistakes: ['Acentuar algunas notas más que otras.', 'Llegar tarde a los cambios de cuerda o de posición.', 'Dejar sonar la cuerda anterior.', 'Tensar la mano en los estiramientos.'],
        criterion: 'Si te cuesta, practica cada grupo por separado y luego únelos. Sube la velocidad cuando todo suene parejo.',
        perRow: 12,
        figure: 'sextillos',
        artist: 'yngwie-malmsteen',
        bpm: 60,
        // El arpegio final de Bm va en sweep: púa solo al cambiar de cuerda, hammer-on / pull-off en la primera.
        legatoFrom: yngwieBars.flat().length - bmSweep.length,
        pattern: yngwieBars.flat(),
    },
    'licks-phrasing-yngwie-02': {
        description: 'Una bajada neoclásica de Yngwie Malmsteen en Em armónica, grupos de cuatro notas que bajan por la primera cuerda hasta E y un arpegio disminuido que sigue bajando de 3 en 3 trastes.',
        notation: 'Em armónica · Semicorcheas: un grupo de cuatro notas por pulso · Púa alternada continua',
        goal: 'Desplazar la mano a lo largo de la cuerda sin perder el pulso: cada grupo empieza dos trastes más abajo que el anterior.',
        steps: [
            'Escucha el ejercicio primero para tener el sonido en la cabeza.',
            'Cada grupo es nota, salto arriba, paso abajo y la nota otra vez (19–22–20–19). El siguiente empieza en la nota de abajo de la escala.',
            'Todo va en la primera cuerda: la mano baja por el mástil en cada grupo, guiada por el brazo.',
            'El D# (traste 11) es la sensible de la escala armónica: resuelve en el 12.',
            'Luego viene el arpegio de D#dim7: 8/1, 10/2, 11/3 y 8/3. Desde el 8/3 haz slide a 5/3 y sube la misma forma 3 trastes más abajo hasta 5/1.',
            'Desde el 5/1 haz slide a 2/1, baja otra vez la forma (4/2, 5/3, 2/3) y termina en 5/2 con una negra: un pulso entero, dejándola sonar. En los slides (s) no hay púa.',
            'Púa alternada continua, empezando con ⊓.',
        ],
        mistakes: ['Llegar tarde al primer tiempo de cada grupo al desplazar la mano.', 'Dejar sonar las cuerdas del arpegio una sobre otra.', 'Estirar la mano en lugar de moverla con el brazo.', 'Dejar de alternar la púa en los saltos.'],
        criterion: 'Baja de un tirón sin pausas entre grupos. Sube la velocidad cuando todos los grupos suenen parejos.',
        perRow: 16,
        figure: 'semicorcheas',
        artist: 'yngwie-malmsteen',
        bpm: 100,
        pattern: yngwieDescent,
    },
    'licks-phrasing-becker-01': {
        description: 'Un estudio de Jason Becker: arpegios en sweep sobre tres cuerdas, con pull-off en la primera cuerda, que suben por el mástil y bajan al final hasta la sexta cuerda.',
        notation: 'Corcheas: una figura por fila · Sweep: púa solo al cambiar de cuerda, ligado en la misma cuerda',
        goal: 'Barrer las cuerdas con un solo movimiento de púa en cada dirección y ligar las notas de la primera cuerda sin perder el pulso al cambiar de posición.',
        steps: [
            'Escucha el ejercicio primero para tener el sonido en la cabeza.',
            'Cada figura empieza en la primera cuerda con un pull-off (p) y barre la segunda y la tercera: la púa cae hacia abajo al bajar a las cuerdas graves y hacia arriba al volver.',
            'Practica cada compás por separado hasta que suene parejo y luego únelos de dos en dos.',
            'En los cambios de posición (compases 5, 6, 13 y 14) deja que el brazo lleve la mano; no estires los dedos.',
            'El último compás baja por el arpegio hasta la sexta cuerda: mantén el barrido igual de limpio en las cuerdas graves.',
        ],
        mistakes: ['Que las notas del barrido suenen juntas como un acorde: levanta cada dedo al pasar a la siguiente cuerda.', 'Atacar con púa las notas ligadas.', 'Acelerar en los barridos y frenar en los pull-offs.'],
        criterion: 'Toca todo el estudio sin pausas y con las notas al mismo volumen. Sube el BPM solo cuando el sweep no suene a acorde.',
        // Algunos compases traen 17 o 18 notas: con 18 por fila cada compás entra entero en una fila.
        perRow: 18,
        figure: 'corcheas',
        picking: 'legato',
        artist: 'jason-becker',
        bpm: 50,
        ...withSections(beckerBars.map(pattern => ({ title: '', pattern }))),
    },
    'licks-phrasing-vinnie-01': {
        description: 'Un lick de Vinnie Moore en Am: la escala baja con tres notas por cuerda, cambia de posición a mitad de camino y resuelve en A.',
        notation: 'Am natural · Sextillos: dos cuerdas por pulso · Púa alternada continua',
        goal: 'Bajar la escala con púa alternada continua y cambiar de posición sin que se note un corte en el sonido.',
        steps: [
            'Escucha el ejercicio primero para tener el sonido en la cabeza.',
            'Cada cuerda tiene tres notas que bajan (13–12–10 en la primera). Cada dos cuerdas es un sextillo: un pulso.',
            'Después de la cuarta cuerda vuelves a la tercera dos trastes más abajo (10–9–7): ahí la mano baja a la posición siguiente.',
            'Púa alternada continua, empezando con ⊓. La última nota, el 5 de la sexta cuerda, es la resolución: una negra, un pulso entero.',
        ],
        mistakes: ['Cortar el pulso al volver a la tercera cuerda.', 'Acentuar la primera nota de cada cuerda.', 'Reiniciar la púa con ⊓ en cada cuerda en vez de seguir alternando.'],
        criterion: 'Toca el lick completo sin pausas en el cambio de posición. Sube la velocidad cuando los ocho grupos suenen parejos.',
        perRow: 12,
        figure: 'sextillos',
        artist: 'vinnie-moore',
        bpm: 80,
        pattern: vinnieDescent,
    },
    'arpeggios-modal-chain': {
        description: 'Los siete arpegios modales de la escala mayor de C, de corrido y sin pausas, hasta la octava: CMaj7, Dm13, Em7(b9), FMaj7(#11), G7, Am7, Bm7b5 y de nuevo CMaj7, subiendo por el mástil. Solo dórico, frigio y lidio llevan tensión; los otros cuatro son los mismos arpegios de séptima, sin alteración.',
        notation: ARPEGGIO_TEXT,
        goal: 'Recorrer los siete modos en un solo pasaje y oír cómo cambia el color en cada grado: la trecena del dórico, la b9 del frigio y la #11 del lidio.',
        steps: ['El orden es el de la escala: I jónico, II dórico, III frigio, IV lidio, V mixolidio, VI eólico, VII locrio y cierra en la octava con CMaj7.', 'Cada arpegio termina en la quinta cuerda y el siguiente empieza en la misma cuerda, uno o dos trastes más arriba.', 'Solo tres arpegios cambian respecto a «Los arpegios de séptima encadenados»: Dm13 (dórico), Em7(b9) (frigio) y FMaj7(#11) (lidio). Jónico, mixolidio, eólico y locrio son los mismos arpegios de séptima, sin alteración.', 'Bm7b5 va una octava arriba (traste 14) para seguir subiendo sin saltos, y el CMaj7 final, en el traste 15.', 'Una nota por corchea, sin pausas entre acordes. Empieza lento: son 128 notas seguidas.'],
        mistakes: ['Detenerse o acentuar el primer tiempo de cada arpegio nuevo.', 'Tocar la séptima del arpegio de séptima en lugar de la tensión del modo.', 'Tensar la mano en los trastes altos.'],
        criterion: 'Recorre los ocho arpegios sin cortes antes de subir el BPM. Si un cambio falla, practica solo ese par de arpegios.',
        figure: 'corcheas',
        bpm: 70,
        perRow: 16,
        picking: 'legato',
        ...withSections([
            ...MODAL_ARPEGGIOS.map(({ mode, degree, chord, pattern }) => ({
                title: `${chord} · ${mode} · ${degree}`,
                // Locrio una octava arriba (traste 14): sigue la subida en lugar de saltar al traste 2.
                pattern: degree === 'VII' ? pattern.map(note => ({ ...note, fret: note.fret + 12 })) : pattern,
            })),
            { title: 'CMaj7 · jónico · I (octava)', pattern: ARPEGGIOS.cmaj7.map(note => ({ ...note, fret: note.fret + 12 })) },
        ]),
    },
    ...Object.fromEntries(MODAL_ARPEGGIOS.map(arpeggio => [`arpeggios-modal-${arpeggio.id}`, modalArpeggioStudy(arpeggio)])),
    ...Object.fromEntries([1, 2, 3, 4, 5].map(position => [`pentatonic-0${position}`, pentatonicStudy(position)])),
    ...Object.fromEntries([1, 2, 3, 4, 5].map(position => [`pentatonic-sweep-0${position}`, pentatonicSweepStudy(position)])),
};

/** Cómo se ataca cada nota: púa abajo (⊓), púa arriba (V), hammer-on (h) o pull-off (p). */
export type Stroke = 'down' | 'up' | 'hammer' | 'pull' | 'slide';

/** Ataque de cada nota del patrón según la técnica del estudio. */
export function pickingOf(pattern: PatternNote[], picking: PracticeStudy['picking'] = 'alternate', legatoFrom = Infinity): Stroke[] {
    if (picking === 'alternate' && legatoFrom === Infinity) return pattern.map((note, index) => note.slide ? 'slide' : index % 2 === 0 ? 'down' : 'up');
    // Arpegios: la púa solo ataca al cambiar de cuerda, siguiendo el movimiento (⊓ hacia la aguda, V hacia la grave);
    // en la misma cuerda se liga: hammer-on si el traste sube, pull-off si baja. Cuerda 1 = la más aguda.
    return pattern.map((note, index) => {
        if (note.slide) return 'slide';
        if (picking === 'alternate' && index < legatoFrom) return index % 2 === 0 ? 'down' : 'up';
        const previous = pattern[index - 1];
        // Primera nota del patrón o del tramo de arpegio: empieza el barrido hacia abajo.
        if (!previous || index === legatoFrom) return 'down';
        if (note.string < previous.string) return 'down';
        if (note.string > previous.string) return 'up';
        return note.fret > previous.fret ? 'hammer' : 'pull';
    });
}
