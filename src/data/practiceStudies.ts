import type { PatternNote } from '@/lib/audio/practiceRound';

import type { Difficulty } from './questMock';
import { TABS } from './tabs/tabs.generated';

export type Figure = 'negras' | 'corcheas' | 'tresillos' | 'semicorcheas' | 'sextillos';

/** Notas por pulso y nombre visible de cada figura. */
export const FIGURES: Record<Figure, { notesPerBeat: number; label: string; perBeat: string }> = {
    negras: { notesPerBeat: 1, label: 'Negras · 1 nota por pulso', perBeat: 'Una nota por pulso' },
    corcheas: { notesPerBeat: 2, label: 'Corcheas · 2 notas por pulso', perBeat: 'Dos notas por pulso' },
    tresillos: { notesPerBeat: 3, label: 'Tresillos · 3 notas por pulso', perBeat: 'Tres notas por pulso' },
    semicorcheas: { notesPerBeat: 4, label: 'Semicorcheas · 4 notas por pulso', perBeat: 'Cuatro notas por pulso' },
    sextillos: { notesPerBeat: 6, label: 'Sextillos · 6 notas por pulso', perBeat: 'Seis notas por pulso' },
};

/**
 * Velocidad: cinco niveles fijos en lugar de BPM sueltos. Las lecciones en corcheas suben por una escalera que pasa a
 * semicorcheas a mitad de camino (de 2 a 10,7 notas por segundo, sin bajar nunca de 60 BPM para no perder el pulso).
 * Las demás conservan su figura y cada nivel solo cambia el BPM.
 */
export type Speed = 1 | 2 | 3 | 4 | 5;
export const SPEEDS: { speed: Speed; name: string }[] = [
    { speed: 1, name: 'Base' },
    { speed: 2, name: 'Estable' },
    { speed: 3, name: 'Fluido' },
    { speed: 4, name: 'Intenso' },
    { speed: 5, name: 'Extremo' },
];
const LADDER: { figure: Figure; bpm: number }[] = [
    { figure: 'corcheas', bpm: 60 },
    { figure: 'corcheas', bpm: 90 },
    { figure: 'semicorcheas', bpm: 70 },
    { figure: 'semicorcheas', bpm: 120 },
    { figure: 'semicorcheas', bpm: 160 },
];
const FIXED_BPM = [60, 80, 100, 120, 160];
export const speedName = (speed: Speed) => SPEEDS[speed - 1].name;
/** Figura y BPM con que suena una lección (su figura base) a cierta velocidad. */
export const speedPlan = (figure: Figure, speed: Speed): { figure: Figure; bpm: number } =>
    figure === 'corcheas' ? LADDER[speed - 1] : { figure, bpm: FIXED_BPM[speed - 1] };
/** Nivel más cercano a un intento guardado solo con BPM (antes de los niveles): compara notas por segundo. */
export const speedFromBpm = (figure: Figure, bpm: number): Speed => {
    const rate = bpm * FIGURES[figure].notesPerBeat;
    const rates = SPEEDS.map(({ speed }) => { const plan = speedPlan(figure, speed); return plan.bpm * FIGURES[plan.figure].notesPerBeat; });
    return rates.reduce((best, value, index) => Math.abs(value - rate) < Math.abs(rates[best] - rate) ? index : best, 0) + 1 as Speed;
};

export type PracticeStudy = {
    description: string;
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
     * `tapping`: sin púa; las notas con `tap` van con la mano derecha (T) y el resto se liga
     * (pull-off al bajar, hammer-on al subir o al cambiar de cuerda).
     */
    picking?: 'alternate' | 'legato' | 'tapping';
    /** Desde esta nota (índice del patrón) se usa la técnica de arpegio (`legato`), p. ej. un sweep al final de un lick. */
    legatoFrom?: number;
    /** Autor del patrón cuando es de un guitarrista destacado (id de `data/artists`): se le da el crédito. */
    artist?: string;
    /** Quién transcribió el patrón (se muestra junto al crédito del artista). */
    transcribedBy?: string;
    /** Velocidad sugerida (1–5, ver `SPEEDS`); 2 por defecto. */
    speed?: Speed;
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
// Todos en corcheas (16 notas, dos compases de 4/4) o semicorcheas según la velocidad, sobre la escala mayor de C.
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
/** Lo que transmite cada modo, para la descripción de su arpegio. */
const MODAL_FEEL: Record<string, string> = {
    jónico: 'El jónico es la escala mayor pura: alegre, estable y luminoso.',
    dórico: 'El dórico es un menor con luz: melancólico pero con groove, el sonido de Santana y del funk.',
    frigio: 'El frigio es oscuro e intenso, con un inconfundible aire español y flamenco.',
    lidio: 'El lidio suena a sueño y a cielo abierto: mayor, pero con un brillo mágico que parece flotar.',
    mixolidio: 'El mixolidio es mayor con actitud: suena a rock, a blues y a carretera.',
    eólico: 'El eólico es la escala menor natural: triste, nostálgica y emotiva.',
    locrio: 'El locrio es el modo más inestable: tenso, sombrío y siempre a punto de resolver.',
};
const modalArpeggioStudy = ({ mode, degree, chord, color, pattern, fromSeventh }: typeof MODAL_ARPEGGIOS[number]): PracticeStudy => ({
    description: fromSeventh
        ? `${MODAL_FEEL[mode]} Su arpegio es el mismo ${chord} que ya practicaste, así que puedes concentrarte en escuchar su color.`
        : `${MODAL_FEEL[mode]} El arpegio ${chord} encierra ese color en pocas notas, para que lo uses directamente en tus solos.`,
    goal: fromSeventh
        ? `Escuchar el arpegio de séptima como el color del modo ${mode}: no se le suma ninguna tensión.`
        : `Escuchar el color del modo ${mode}: la cuatriada del grado más su intervalo característico.`,
    steps: [color, ...(fromSeventh ? [`Sin alteraciones: es exactamente el ${chord} de «${fromSeventh}», en los arpegios de séptima. Si ya lo dominas, úsalo para comparar su color con el de los modos que sí llevan tensión.`] : []), 'Sube desde la quinta cuerda hasta la primera y vuelve, una nota por subdivisión del metrónomo.', 'Púa solo al cambiar de cuerda; en la misma cuerda liga con hammer-on y pull-off.', 'Toca el acorde antes y después del arpegio para tener su sonido en el oído.'],
    mistakes: ['Dejar sonar dos notas a la vez al cruzar de cuerda.', 'Perder la nota de la tensión: es la que da el color del modo.', 'Acelerar en la bajada.'],
    criterion: 'Cuando el arpegio suene parejo a una velocidad cómoda, sube el BPM. La meta es llegar a Intenso.',
    figure: 'corcheas',
    speed: 2,
    perRow: 16,
    picking: 'legato',
    ...withSections([{ title: `${chord} · ${mode} · grado ${degree}`, pattern }]),
});

const withSections = (sections: { title: string; pattern: PatternNote[] }[]) => ({ sections, pattern: sections.flatMap(section => section.pattern) });

const slideTo = (string: number, fret: number): PatternNote => ({ string, fret, slide: true });

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
/** Descripción de cada posición de la pentatónica (grupos de tres cuerdas). */
const PENTATONIC_TEXT = [
    'La caja más famosa de la guitarra, donde nacen casi todos los solos de rock y blues. Tres cuerdas adelante, dos atrás: la pentatónica de siempre empieza a sonar a frase.',
    'La segunda caja enlaza con la primera y te saca de la zona cómoda. Es la de los bends en la segunda cuerda y de muchas frases de B.B. King.',
    'Una posición más abierta y brillante, porque arranca en la nota más aguda de la escala. Aquí aparecen frases que en la primera caja nunca salen.',
    'La caja más estirada: pide una mano flexible y conecta el centro del mástil con la zona aguda. Dominarla te deja cruzar el brazo sin pensar.',
    'La última posición cierra el círculo y vuelve a la primera una octava arriba. Intensa, con las notas agudas que hacen gritar a un solo.',
];
const pentatonicStudy = (position: number): PracticeStudy => {
    const frets = PENTATONIC_G[position - 1];
    return {
        description: PENTATONIC_TEXT[position - 1],
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
        speed: 1,
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
/** Descripción de cada patrón extendido con sweep. */
const PENTATONIC_SWEEP_TEXT = [
    'Así suenan los solos que corren por el mástil como una cascada. Unes la primera y la segunda posición y las tocas en sweep: muchas notas, poco esfuerzo de la púa.',
    'El segundo tramo sube un poco más por el mástil y une la segunda caja con la tercera. Es un recurso clásico de Zakk Wylde o Paul Gilbert para encender un solo: muchas notas, poco esfuerzo de la púa.',
    'Desde el centro del mástil, este patrón enlaza la tercera y la cuarta posición. Suena amplio y brillante, y entrena a la mano izquierda para estirarse mientras la derecha barre las cuerdas sin frenar.',
    'Un tramo largo que lleva la pentatónica a la zona aguda, uniendo la cuarta y la quinta caja. Las notas saltan de cuerda en cuerda como en un arpegio y el solo gana velocidad y dramatismo.',
    'El último patrón cierra el ciclo: une la quinta posición con la primera, una octava más arriba. Es la cascada más aguda y brillante de todas, ideal para el clímax de un solo.',
];
const pentatonicSweepStudy = (position: number): PracticeStudy => {
    const up = pentatonicSweepUp(position);
    // La bajada no repite la última nota de arriba y termina en la primera de la sexta cuerda, más larga.
    const down = [...up].reverse().slice(1).map((note, index, all) => index === all.length - 1 ? { ...note, beats: 2.5 } : note);
    const frets = up.map(note => note.fret);
    const [low, high] = [Math.min(...frets), Math.max(...frets)];
    const [first, , middle, , last] = up;
    return {
        description: PENTATONIC_SWEEP_TEXT[position - 1],
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
        speed: 1,
        perRow: 16,
        pattern: [...up, ...down],
    };
};

// Modos de la escala mayor de C (patrón del curso de erpskool, «Escala de Do mayor») y de C menor armónica y C menor
// melódica, que parten de la misma tónica: cada modo usa las notas de su escala y sale de su grado (D dórico, E frigio…), en el orden de los
// grados. Tres notas por cuerda desde la tónica en la quinta cuerda, dos octavas; cada parte sube una cuerda más que la
// anterior y regresa. La última baja hasta la sexta cuerda, vuelve a subir y termina en la tónica.
const OPEN_MIDI = [64, 59, 55, 50, 45, 40];
/** Escalas madre: nota de partida (clase de altura), semitonos de cada grado desde ella y nombres de sus notas. */
const PARENT_SCALES = {
    major: { tonic: 0, steps: [0, 2, 4, 5, 7, 9, 11], names: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], name: 'la escala mayor de C', short: 'C mayor', category: 'Modos de la escala mayor' },
    harmonic: { tonic: 0, steps: [0, 2, 3, 5, 7, 8, 11], names: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'B'], name: 'la menor armónica de C', short: 'C menor armónica', category: 'Modos de la menor armónica' },
    melodic: { tonic: 0, steps: [0, 2, 3, 5, 7, 9, 11], names: ['C', 'D', 'Eb', 'F', 'G', 'A', 'B'], name: 'la menor melódica de C', short: 'C menor melódica', category: 'Modos de la menor melódica' },
    bebop: { tonic: 0, steps: [0, 2, 4, 5, 7, 9, 10, 11], names: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'B'], name: 'la bebop dominante de C', short: 'C bebop dominante', category: 'Modos de la bebop dominante' },
} as const;
/** Modos en el orden en que se presentan: id de lección, escala madre y grado del que salen. */
export const SCALE_MODES = [
    { id: 'scales-01', scale: 'major', degree: 0, mode: 'jónico', color: 'La escala mayor de toda la vida: alegre, estable y luminosa. Suena a final feliz y es la base del pop y el punto de partida para entender los demás modos.' },
    { id: 'scales-02', scale: 'major', degree: 1, mode: 'dórico', color: 'Un menor que no se pone triste: melancolía con luz y groove. Suena a funk, a Santana y a mucho rock clásico, ideal para un solo menor que no sea un lamento.' },
    { id: 'scales-03', scale: 'major', degree: 2, mode: 'frigio', color: 'Oscuro, intenso y con aire español desde la primera nota. Su segunda nota, pegada a la tónica, le da un sabor a flamenco y a metal pesado. Suena amenazante y dramático.' },
    { id: 'scales-04', scale: 'major', degree: 3, mode: 'lidio', color: 'Suena a sueño y a cielo abierto: mayor, pero con un brillo extraño que parece flotar. Es el sonido de las bandas sonoras de ciencia ficción y de Joe Satriani o Steve Vai cuando quieren algo mágico.' },
    { id: 'scales-05', scale: 'major', degree: 4, mode: 'mixolidio', color: 'Mayor pero relajado, con actitud. Suena a rock, a blues y a canción de carretera: alegre sin ser ingenuo. Es el modo de muchos riffs de AC/DC, de los Beatles y del rock sureño.' },
    { id: 'scales-06', scale: 'major', degree: 5, mode: 'eólico', color: 'La escala menor natural: triste, nostálgica y emotiva. Es el sonido de las baladas, del rock melódico y de mucho metal. Cuando quieres que un solo "llore", empiezas por aquí.' },
    { id: 'scales-07', scale: 'major', degree: 6, mode: 'locrio', color: 'El modo más inestable de todos: tenso, sombrío, como si nunca terminara de resolver. Se usa poco como escala principal, pero en el metal extremo da ese sonido oscuro e incómodo que nada más logra.' },
    { id: 'scales-harmonic-01', scale: 'harmonic', degree: 0, mode: 'menor armónica', color: 'Dramática y elegante, con un salto que le da aire árabe y clásico. Es Bach en la guitarra eléctrica: Yngwie Malmsteen construyó todo su estilo sobre ella.' },
    { id: 'scales-harmonic-02', scale: 'harmonic', degree: 1, mode: 'locrio ♮6', color: 'Sombría pero no tanto: una versión un poco más amable del locrio. Suena misteriosa e inquieta, buena para pasajes oscuros que todavía tienen algo de melodía.' },
    { id: 'scales-harmonic-03', scale: 'harmonic', degree: 2, mode: 'jónico #5', color: 'Mayor pero inquieto: brilla, aunque hay algo que no termina de estar en su lugar. Suena extraño y llamativo, útil para darle un toque raro a una melodía alegre.' },
    { id: 'scales-harmonic-04', scale: 'harmonic', degree: 3, mode: 'dórico #4', color: 'Menor con perfume de Europa del Este y de música gitana. Suena antiguo y misterioso, como una melodía popular de los Balcanes. Le da color exótico a un solo menor.' },
    { id: 'scales-harmonic-05', scale: 'harmonic', degree: 4, mode: 'frigio dominante', color: 'El sonido del flamenco, de la música árabe y del metal neoclásico: exótico, intenso y muy reconocible. La favorita para los solos rápidos con aire oriental.' },
    { id: 'scales-harmonic-06', scale: 'harmonic', degree: 5, mode: 'lidio #2', color: 'Mayor, luminosa y exótica al mismo tiempo. Tiene el brillo flotante del lidio pero con un giro raro que la hace sonar a cuento oriental. Muy usada para pasajes épicos y misteriosos.' },
    { id: 'scales-harmonic-07', scale: 'harmonic', degree: 6, mode: 'superlocrio bb7', color: 'Pura tensión: suena a suspenso, a película de terror, a algo que está por pasar. Es el color del acorde disminuido y sirve para crear ese momento de nervio antes de resolver.' },
    { id: 'scales-melodic-01', scale: 'melodic', degree: 0, mode: 'menor melódica', color: 'Un menor suave y sofisticado: triste al comienzo, pero se ilumina al subir. Es el sonido del jazz moderno, elegante y nada dramático. Pat Metheny y los guitarristas de fusión la usan muchísimo.' },
    { id: 'scales-melodic-02', scale: 'melodic', degree: 1, mode: 'dórico b2', color: 'Oscura y misteriosa, cercana al sabor español del frigio pero más suave. Suena a jazz nocturno, con un toque exótico.' },
    { id: 'scales-melodic-03', scale: 'melodic', degree: 2, mode: 'lidio aumentado', color: 'Etérea y flotante: suena a espacio, a algo que se eleva sin terminar de aterrizar. Es una de las sonoridades más "mágicas" que existen, ideal para momentos atmosféricos.' },
    { id: 'scales-melodic-04', scale: 'melodic', degree: 3, mode: 'lidio dominante', color: 'Brillante y juguetona, con actitud. Suena a fusión, a jazz moderno y a las bandas sonoras de los Simpson. Es mayor y alegre, pero con un brillo travieso.' },
    { id: 'scales-melodic-05', scale: 'melodic', degree: 4, mode: 'mixolidio b6', color: 'Mayor con un fondo melancólico: alegre y triste a la vez, como una canción de despedida. Suena muy cinematográfico, especialmente en el rock instrumental.' },
    { id: 'scales-melodic-06', scale: 'melodic', degree: 5, mode: 'locrio ♮2', color: 'Oscura pero con un rayo de luz. Es el sonido natural del jazz cuando aparece un acorde semidisminuido: misterioso, delicado y sofisticado.' },
    { id: 'scales-melodic-07', scale: 'melodic', degree: 6, mode: 'alterado', color: 'La máxima tensión posible: todo suena fuera de lugar justo antes de resolver. El truco del jazz para que la llegada al acorde final se sienta enorme.' },
    { id: 'scales-bebop-01', scale: 'bebop', degree: 0, mode: 'bebop dominante', color: 'La bebop más usada del jazz: el mixolidio con una nota de paso. En corcheas, las notas del acorde caen en el tiempo fuerte. Es el sonido de Charlie Parker.' },
    { id: 'scales-bebop-02', scale: 'bebop', degree: 1, mode: 'dórico bebop', color: 'Un menor con luz y con swing: la melancolía del dórico con un paso cromático que lo hace deslizarse. Suena a jazz relajado.' },
    { id: 'scales-bebop-03', scale: 'bebop', degree: 2, mode: 'frigio con cromatismo', color: 'Oscuro y con aire español como el frigio, pero el cromatismo le quita peso y lo pone en movimiento. Suena misterioso y nocturno, con una tensión que no se queda quieta.' },
    { id: 'scales-bebop-04', scale: 'bebop', degree: 3, mode: 'lidio-jónico', color: 'Mayor y luminoso, con un pie en el lidio y otro en el jónico: el brillo flotante de la cuarta aumentada convive con la estabilidad de la escala mayor. Suena abierto, elegante y un poco soñador.' },
    { id: 'scales-bebop-05', scale: 'bebop', degree: 4, mode: 'mixolidio con cromatismo', color: 'Mayor con actitud, como el mixolidio, pero con un paso cromático que le da un aire de blues sofisticado. Suena a rock con swing y a final de tema de jazz.' },
    { id: 'scales-bebop-06', scale: 'bebop', degree: 5, mode: 'menor con cromatismo', color: 'La menor natural, nostálgica y emotiva, con una nota de paso que la hace fluir. Suena a balada de jazz, triste pero con movimiento.' },
    { id: 'scales-bebop-07', scale: 'bebop', degree: 6, mode: 'rotación desde b7', color: 'Arranca en la séptima menor del acorde, así que suena inquieta desde la primera nota: brillante, con algo de lidio y de dominante, como una frase que siempre está en camino a otro lugar.' },
    { id: 'scales-bebop-08', scale: 'bebop', degree: 7, mode: 'rotación desde 7', color: 'La más rara de todas: empieza en la nota de paso, así que suena tensa e inestable, sombría como el locrio y con un deslizamiento cromático que busca dónde resolver.' },
] as const;
type ScaleMode = typeof SCALE_MODES[number];
/** Título de la lección: tónica del modo y su nombre (C menor armónica, G frigio dominante…). */
export const modeTitle = ({ scale, degree, mode }: ScaleMode) => `${PARENT_SCALES[scale].names[degree]} ${mode}`;
/** Grupo de la lección dentro del módulo: los modos de su escala madre. */
export const modeCategory = ({ scale }: ScaleMode) => PARENT_SCALES[scale].category;
const note = (string: number, midi: number): PatternNote => ({ string, fret: midi - OPEN_MIDI[string - 1] });
const modeStudy = ({ scale: parentId, degree, mode, color }: ScaleMode): PracticeStudy => {
    const parent = PARENT_SCALES[parentId];
    const root = parent.names[degree];
    const steps: readonly number[] = parent.steps;
    const size = steps.length;
    // La tónica va en la quinta cuerda entre los trastes 1 y 12.
    const rootMidi = 45 + (((parent.tonic + steps[degree] - 9 + 24) % 12) || 12);
    const scale = (offset: number) => { const index = degree + offset; return rootMidi - steps[degree] + steps[((index % size) + size) % size] + Math.floor(index / size) * 12; };
    const up = Array.from({ length: 15 }, (_, index) => note(5 - Math.floor(index / 3), scale(index)));
    const below = [-1, -2, -3].map(offset => note(6, scale(offset)));
    const part = (strings: number) => [...up.slice(0, strings * 3), ...up.slice(1, strings * 3 - 1).reverse()];
    const start = up[0].fret;
    return {
        description: color,
        goal: `Conocer las posiciones de ${root} ${mode} en el mástil, escuchar su color frente a los otros modos de ${parent.short} y mejorar el picking.`,
        steps: [
            `Antes del patrón, toca la escala completa: de ${root} en el traste ${start} de la quinta cuerda ${size === 7 ? `a ${root} en el traste ${up[14].fret} de la primera, dos octavas más arriba` : `hasta el traste ${up[14].fret} de la primera`}.`,
            `El patrón tiene cuatro partes. Cada una sale de ${root}, sube una cuerda más que la anterior y regresa hasta el traste ${up[1].fret} de la quinta cuerda.`,
            `En la cuarta parte sube hasta la primera cuerda, regresa por todas las notas hasta la sexta, vuelve a subir (${below[1].fret} y ${below[0].fret}) y termina en ${root}, en el traste ${start} de la quinta cuerda.`,
            'Al subir, mantén apoyados los dedos que ya pisaste; al bajar, levántalos uno a uno para que suene la nota anterior.',
            'Toca con púa alternada y silencia con la mano las cuerdas que ya no usas.',
        ],
        mistakes: ['Levantar los dedos al subir: se pierde el contacto con el mástil.', 'Dejar sonar las cuerdas que ya tocaste.', 'Correr antes de que el patrón se sienta fluido.'],
        criterion: 'Toca las cuatro partes de corrido, lento y sin pausas. Sube el BPM solo cuando todas las notas suenen limpias y parejas.',
        figure: 'corcheas',
        speed: 2,
        ...withSections([
            { title: 'Hasta la cuarta cuerda', pattern: part(2) },
            { title: 'Hasta la tercera cuerda', pattern: part(3) },
            { title: 'Hasta la segunda cuerda', pattern: part(4) },
            { title: 'Hasta la primera cuerda y de vuelta', pattern: [...up, ...up.slice(0, 14).reverse(), ...below, below[1], below[0], up[0]] },
        ]),
    };
};

/** Escalas simétricas: se repiten cada pocos semitonos, así que no tienen modos propios. Todas desde C. */
export const SYMMETRIC_SCALES = [
    { id: 'scales-symmetric-01', title: 'C tonal', shift: 2, steps: [0, 2, 4, 6, 8, 10], names: ['C', 'D', 'E', 'F#', 'G#', 'A#'], color: 'Suena a sueño, a algo que flota. Todas sus notas están a la misma distancia, así que ninguna se siente como casa. Es el sonido de los flashbacks del cine y de Debussy.' },
    { id: 'scales-symmetric-02', title: 'C disminuida', shift: 3, steps: [0, 2, 3, 5, 6, 8, 9, 11], names: ['C', 'D', 'Eb', 'F', 'Gb', 'Ab', 'A', 'B'], color: 'Suena a suspenso, a escalera que nunca llega arriba. Oscura y tensa, es el sonido del cine de terror y de las carreras amenazantes del metal neoclásico.' },
    { id: 'scales-symmetric-03', title: 'C semitono disminuida', shift: 3, steps: [0, 1, 3, 4, 6, 7, 9, 10], names: ['C', 'Db', 'Eb', 'E', 'F#', 'G', 'A', 'Bb'], color: 'Jazz y blues con picante: brillante y chirriante a la vez. Crea mucha tensión antes de resolver, por eso suena sobre el dominante que está por caer en su tónica.' },
] as const;
type SymmetricScale = typeof SYMMETRIC_SCALES[number];
const symmetricStudy = ({ title, shift, steps, color }: SymmetricScale): PracticeStudy => {
    // Tres notas por cuerda desde C en el traste 3 de la quinta cuerda.
    const scale = (index: number) => 48 + steps[((index % steps.length) + steps.length) % steps.length] + Math.floor(index / steps.length) * 12;
    const up = Array.from({ length: 15 }, (_, index) => note(5 - Math.floor(index / 3), scale(index)));
    const below = [-1, -2, -3].map(offset => note(6, scale(offset)));
    const part = (strings: number) => [...up.slice(0, strings * 3), ...up.slice(1, strings * 3 - 1).reverse()];
    return {
        description: color,
        goal: `Conocer la digitación de ${title} en el mástil, escuchar su color simétrico y mejorar el picking.`,
        steps: [
            `Antes del patrón, toca la escala completa: tres notas por cuerda desde C en el traste 3 de la quinta cuerda hasta el traste ${up[14].fret} de la primera.`,
            `Es simétrica: la misma digitación se repite cada ${shift} trastes, así que puedes moverla por el mástil sin cambiar de forma.`,
            'El patrón tiene cuatro partes. Cada una sale de C, sube una cuerda más que la anterior y regresa a la quinta cuerda.',
            `En la cuarta parte sube hasta la primera cuerda, regresa por todas las notas hasta la sexta, vuelve a subir (${below[1].fret} y ${below[0].fret}) y termina en C, en el traste 3 de la quinta cuerda.`,
            'Toca con púa alternada y silencia con la mano las cuerdas que ya no usas.',
        ],
        mistakes: ['Confundir el orden de tonos y semitonos: repite la fórmula en voz alta mientras tocas.', 'Dejar sonar las cuerdas que ya tocaste.', 'Correr antes de que el patrón se sienta fluido.'],
        criterion: 'Toca las cuatro partes de corrido, lento y sin pausas. Sube el BPM solo cuando todas las notas suenen limpias y parejas.',
        figure: 'corcheas',
        speed: 2,
        ...withSections([
            { title: 'Hasta la cuarta cuerda', pattern: part(2) },
            { title: 'Hasta la tercera cuerda', pattern: part(3) },
            { title: 'Hasta la segunda cuerda', pattern: part(4) },
            { title: 'Hasta la primera cuerda y de vuelta', pattern: [...up, ...up.slice(0, 14).reverse(), ...below, below[1], below[0], up[0]] },
        ]),
    };
};

// Transcripciones (licks de artistas): se escriben en alphaTex en data/tabs y `npm run tabs` las convierte. Cada
// sección del .alphatex (separada por «|») es un compás o una parte de la lección. La duración se deja solo en las notas
// que no van en la figura del estudio, para que la velocidad pueda cambiar la figura (lecciones en corcheas).
const tabBars = (id: string, figure: Figure): PatternNote[][] => TABS[id].map(bar => bar.map(({ beats, ...note }) =>
    beats !== undefined && Math.abs(beats - 1 / FIGURES[figure].notesPerBeat) > 1e-9 ? { ...note, beats } : note));

// Mano derecha (lección «Ejercicio de mano derecha» de ERP Skool): cuerdas al aire, cuatro golpes por cuerda con púa alternada.
const openStrings = (strings: number[]): PatternNote[] => strings.flatMap(string => [0, 0, 0, 0].map(fret => ({ string, fret })));
const RIGHT_HAND_STEPS = [
    'Solo trabaja la mano derecha: todas las cuerdas van al aire.',
    'Púa alternada ⊓ V ⊓ V en todos los golpes, también al cambiar de cuerda.',
    'Silencia con la palma: solo debe sonar la cuerda que tocas.',
    'Al bajar, inclina ligeramente la púa.',
];
const RIGHT_HAND_MISTAKES = ['Reiniciar con púa abajo al cambiar de cuerda: la alternancia no se interrumpe.', 'Dejar sonando las cuerdas que ya tocaste.', 'Atacar más fuerte con púa abajo que con púa arriba.'];
const rightHandOpen: PracticeStudy = {
    description: 'Todo empieza por la mano derecha. Antes de pensar en notas, la púa aprende a bajar y subir con el mismo peso, como un péndulo. Es la base de toda la velocidad.',
    goal: 'Ejercitar la mano derecha por separado antes de coordinarla con la izquierda: golpes parejos, abajo y arriba, y cambios de cuerda sin cortar la alternancia.',
    steps: RIGHT_HAND_STEPS,
    mistakes: RIGHT_HAND_MISTAKES,
    criterion: 'Cuando los cuatro golpes de cada cuerda suenen parejos y sin ruido de las demás cuerdas, sube el BPM.',
    perRow: 24,
    figure: 'corcheas',
    speed: 1,
    pattern: openStrings([6, 5, 4, 3, 2, 1]),
};
const rightHandSkip: PracticeStudy = {
    description: 'Saltar cuerdas hace que los solos suenen abiertos y grandes. Aquí entrenas ese salto con cuerdas al aire, para cruzar sin perder el ritmo ni tocar la cuerda equivocada.',
    goal: 'Mantener la púa alternada y el control al saltar cuerdas: la púa llega justo a la cuerda que toca sin rozar la que salta.',
    steps: RIGHT_HAND_STEPS,
    mistakes: [...RIGHT_HAND_MISTAKES, 'Rozar la cuerda que saltas.'],
    criterion: 'Cuando los dos recorridos suenen parejos y sin que suene la cuerda que saltas, sube el BPM.',
    figure: 'corcheas',
    speed: 1,
    ...withSections([
        { title: 'Primer recorrido', pattern: openStrings([6, 4, 5, 3, 4, 2, 3, 1]) },
        { title: 'Segundo recorrido', pattern: openStrings([1, 3, 2, 4, 3, 5, 4, 6]) },
    ]),
};
// Modos por octavas: los modos de Bb mayor desde G menor, cada uno con sus seis primeras notas y la misma
// digitación en cada octava (tres notas por cuerda, dos cuerdas por octava), desde la tónica en la sexta cuerda.
const BB_MAJOR = { steps: [0, 2, 4, 5, 7, 9, 11], names: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'] };
export const OCTAVE_MODES = [
    { id: 'alternate-picking-octaves-01', color: "La escala menor como nunca la viste: la misma figura de seis notas se repite en cada octava y la mano se desliza por el mástil. Es el dibujo base de todo el bloque.", degree: 5, title: 'G menor' },
    { id: 'alternate-picking-octaves-02', color: "Tenso y sombrío, siempre a punto de resolver: así es el locrio. Por octavas, su figura se repite como un dibujo y su color oscuro viaja por el mástil.", degree: 6, title: 'A locrio' },
    { id: 'alternate-picking-octaves-03', color: "Alegre, estable y luminoso: el jónico, la escala mayor pura. Por octavas, la mano sube repitiendo la misma figura y la escala deja de vivir en una sola posición.", degree: 0, title: 'Bb jónico' },
    { id: 'alternate-picking-octaves-04', color: "Un menor con luz y groove, el sonido de Santana y del funk: eso es el dórico. Por octavas, aprendes a llevar ese color a cualquier zona del mástil.", degree: 1, title: 'C dórico' },
    { id: 'alternate-picking-octaves-05', color: "Oscuro y con aire español, el frigio se reconoce al instante. Por octavas, su segunda nota pegada a la tónica aparece siempre en el mismo lugar de la figura.", degree: 2, title: 'D frigio' },
    { id: 'alternate-picking-octaves-06', color: "Sueño y cielo abierto: ese es el color del lidio. Tocado por octavas, su figura sube muy alto por el mástil y la mano aprende a moverse cómoda en la zona aguda, donde este modo brilla más.", degree: 3, title: 'Eb lidio' },
    { id: 'alternate-picking-octaves-07', color: "Mayor con actitud, con sabor a rock y a blues: el mixolidio. Empieza abajo, cerca de la cejuela, y la figura sube octava a octava hasta el centro del mástil, con ese color de dominante en cada paso.", degree: 4, title: 'F mixolidio' },
] as const;
const octaveShape = ({ degree, color }: typeof OCTAVE_MODES[number]): PracticeStudy => {
    const { steps, names } = BB_MAJOR;
    // Tónica en la sexta cuerda entre los trastes 1 y 12 (Bb = traste 6).
    const rootMidi = 40 + ((steps[degree] + 6) % 12 || 12);
    const midi = (octave: number, step: number) => rootMidi + octave * 12 + (steps[(degree + step) % 7] - steps[degree] + 12) % 12;
    const at = (string: number, octave: number, degreeSteps: number[]) => degreeSteps.map(step => note(string, midi(octave, step)));
    const notes = [0, 1, 2, 3, 4, 5].map(step => names[(degree + step) % 7]);
    const up = [...at(6, 0, [0, 1, 2]), ...at(5, 0, [3, 4, 5]), ...at(4, 1, [0, 1, 2]), ...at(3, 1, [3, 4, 5]), ...at(2, 2, [0, 1, 2]), ...at(1, 2, [3])];
    const down = [...at(1, 2, [4, 5, 4, 3]), ...at(2, 2, [2, 1, 0]), ...at(3, 1, [5, 4, 3]), ...at(4, 1, [2, 1, 0]), ...at(5, 0, [5, 4, 3])];
    return {
        description: color,
        goal: 'Ver la escala de forma horizontal: reconocer la misma digitación en cada octava y mover la mano por el mástil sin perder la púa alternada.',
        steps: [
            'En cada par de cuerdas tocas la misma figura: tres notas en una cuerda y tres en la siguiente. Al pasar al siguiente par, la figura se repite una octava más arriba.',
            'Desde la cuarta cuerda la figura sube dos trastes, y al llegar a la segunda cuerda sube uno más por la afinación: el dibujo es el mismo, solo cambia de lugar.',
            `Sube de ${notes[0]} en el traste ${up[0].fret} de la sexta cuerda hasta ${notes[3]} en el traste ${up[15].fret} de la primera, y baja por el mismo camino. En la primera cuerda haz el giro (${down.slice(0, 4).map(n => n.fret).join('–')}) antes de bajar.`,
            'Desliza la mano en los cambios de octava sin apretar: el pulgar acompaña el movimiento detrás del mástil.',
            'Púa alternada continua, también al cambiar de cuerda.',
        ],
        mistakes: ['Saltar de posición con un golpe en lugar de deslizar la mano.', 'Perder la alternancia de la púa al cambiar de cuerda.', 'Dejar sonar la nota anterior al cambiar de octava.'],
        criterion: 'Cuando la subida y la bajada suenen parejas y los cambios de posición no se noten, sube el BPM.',
        figure: 'semicorcheas',
        speed: 1,
        ...withSections([
            { title: 'Subida', pattern: up },
            { title: 'Bajada', pattern: down },
        ]),
    };
};
// Dos cuerdas para velocidad: seis notas de una escala menor (tres por cuerda) en grupos de cuatro, 1234 2345 3456 4654 (sin repetir nota entre grupos).
// Cada compás empieza en la nota siguiente de la escala, de C a C, así que la figura se desliza por el mástil.
/** Escalas menores (natural y armónica) por tónica: semitonos de cada grado y nombres de sus notas. */
const MINOR_SCALES = {
    natural: { label: 'menor', steps: [0, 2, 3, 5, 7, 8, 10], names: { C: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'], A: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] } },
    harmonic: { label: 'menor armónica', steps: [0, 2, 3, 5, 7, 8, 11], names: { C: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'B'], A: ['A', 'B', 'C', 'D', 'E', 'F', 'G#'] } },
};
const TONICS = { C: 0, A: 9 };
/** Notas de una escala menor desde la tónica más grave de la cuerda `string` (índice 0 = tónica). */
const minorOnString = (string: number, key: keyof typeof TONICS, scale: keyof typeof MINOR_SCALES) => {
    const { label, steps, names } = MINOR_SCALES[scale];
    const tonicMidi = OPEN_MIDI[string - 1] + (TONICS[key] - OPEN_MIDI[string - 1] % 12 + 12) % 12;
    return { label: `${key} ${label}`, names: names[key], midi: (index: number) => tonicMidi + steps[index % 7] + Math.floor(index / 7) * 12 };
};
export const TWO_STRING_PATTERNS = [
    { id: 'alternate-picking-two-strings-01', low: 2, high: 1, key: 'C', scale: 'natural', title: 'C menor en las cuerdas 2 y 1', description: 'Un patrón para ganar velocidad: dos cuerdas, tres notas en cada una y la misma forma siempre. Cada compás sube una nota y la escala menor se abre en horizontal.' },
    { id: 'alternate-picking-two-strings-03', low: 3, high: 2, key: 'A', scale: 'natural', title: 'A menor en las cuerdas 3 y 2', description: 'La pareja que más enseña el mástil: por la afinación, la segunda cuerda queda un traste corrida y la mano se reajusta en cada compás. Empieza en A, en el traste 2.' },
    { id: 'alternate-picking-two-strings-02', low: 5, high: 4, key: 'C', scale: 'natural', title: 'C menor en las cuerdas 5 y 4', description: 'El patrón de las cuerdas 2 y 1, ahora en los graves: suena grueso, a riff. Misma forma, pero la mano cambia de cuerda en otra zona y la púa pide más firmeza.' },
    { id: 'alternate-picking-two-strings-04', low: 2, high: 1, key: 'C', scale: 'harmonic', title: 'C menor armónica en las cuerdas 2 y 1', description: 'El mismo motor de velocidad con color de menor armónica: el salto entre Ab y B suena a Bach y a Yngwie, y obliga a la mano a abrirse.' },
    { id: 'alternate-picking-two-strings-05', low: 3, high: 2, key: 'A', scale: 'harmonic', title: 'A menor armónica en las cuerdas 3 y 2', description: 'Reto doble: la forma corrida de las cuerdas 3 y 2 y el tono y medio de la armónica. Suena neoclásico desde el primer compás, con la G# empujando a la tónica.' },
    { id: 'alternate-picking-two-strings-06', low: 5, high: 4, key: 'C', scale: 'harmonic', title: 'C menor armónica en las cuerdas 5 y 4', description: 'La menor armónica en los graves suena oscura, a riff neoclásico. Con cuerdas gruesas, el salto entre Ab y B pide mano abierta y púa firme.' },
] as const;
const twoStringStudy = ({ low, high, key, scale, description }: typeof TWO_STRING_PATTERNS[number]): PracticeStudy => {
    // El recorrido arranca en la tónica más grave de la cuerda de abajo.
    const { names, midi } = minorOnString(low, key, scale);
    const bars = [0, 1, 2, 3, 4, 5, 6, 7].map(start => {
        const cell = [0, 1, 2, 3, 4, 5].map(step => note(step < 3 ? low : high, midi(start + step)));
        return { title: `Desde ${names[start % 7]}`, pattern: [0, 1, 2, 3, 1, 2, 3, 4, 2, 3, 4, 5, 3, 5, 4, 3].map(index => cell[index]) };
    });
    const [first, last] = [bars[0].pattern[0].fret, Math.max(...bars[7].pattern.map(n => n.fret))];
    return {
        description,
        goal: 'Ganar velocidad y precisión con la púa alternada en dos cuerdas, recorriendo la escala de forma horizontal.',
        steps: [
            'Cada compás usa seis notas: tres en la cuerda de abajo y tres en la de arriba.',
            'Tócalas en grupos de cuatro: 1-2-3-4, 2-3-4-5, 3-4-5-6 y cierra con 4-6-5-4, para no repetir la nota más alta. Cada grupo cae en un pulso.',
            `El compás siguiente empieza en la nota que sigue de la escala. Arrancas en ${key}, en el traste ${first}, y terminas una octava más arriba, cerca del traste ${last}.`,
            'Desliza la mano un traste o dos entre compases, sin soltar la forma.',
            'Púa alternada continua: no reinicies con púa abajo al cambiar de cuerda.',
        ],
        mistakes: ['Acentuar sin querer el cambio de cuerda en lugar del primer tiempo de cada grupo.', 'Perder la alternancia de la púa al cruzar de cuerda.', 'Subir el BPM antes de que el cambio de compás suene limpio.'],
        criterion: 'Cuando los ocho compases suenen parejos y sin cortes entre ellos, sube el BPM.',
        figure: 'semicorcheas',
        speed: 1,
        ...withSections(bars),
    };
};
// String skipping: la misma celda de dos cuerdas, pero saltando una cuerda. Tres notas en la cuerda grave y las mismas
// tres una octava más arriba en la aguda; `from` es la cuerda por la que empieza cada grupo.
export const SKIP_PATTERNS = [
    { id: 'alternate-picking-skipping-01', low: 5, high: 3, from: 5, key: 'C', scale: 'natural', title: 'C menor con string skipping en las cuerdas 5 y 3', description: 'Saltar cuerdas hace que la escala suene abierta, como un solo. Tres notas en la quinta, saltas la cuarta y las repites una octava arriba mientras la figura sube por el mástil.' },
    { id: 'alternate-picking-skipping-02', low: 5, high: 3, from: 3, key: 'C', scale: 'natural', title: 'C menor con string skipping en las cuerdas 3 y 5', description: 'Las mismas notas, pero cada grupo empieza en la tercera cuerda y cae a la quinta. La púa cruza en sentido contrario, de aguda a grave, y la mano derecha lo siente distinto.' },
    { id: 'alternate-picking-skipping-03', low: 3, high: 1, from: 3, key: 'A', scale: 'natural', title: 'A menor con string skipping en las cuerdas 3 y 1', description: 'El salto se muda a las cuerdas agudas, donde la escala brilla. Ojo: entre la tercera y la primera la octava queda tres trastes adelante, una forma nueva para la mano.' },
    { id: 'alternate-picking-skipping-04', low: 3, high: 1, from: 1, key: 'A', scale: 'natural', title: 'A menor con string skipping en las cuerdas 1 y 3', description: 'Cada grupo nace en la primera cuerda y salta a la tercera. Es el salto más incómodo: la púa cae sobre la segunda sin tocarla. Limpio, suena amplio y sin esfuerzo.' },
    { id: 'alternate-picking-skipping-05', low: 5, high: 3, from: 5, key: 'C', scale: 'harmonic', title: 'C menor armónica con string skipping en las cuerdas 5 y 3', description: 'El salto de cuerda con sabor neoclásico: cada octava suena a violín barroco, y el tono y medio entre Ab y B le da drama a cada salto.' },
    { id: 'alternate-picking-skipping-06', low: 5, high: 3, from: 3, key: 'C', scale: 'harmonic', title: 'C menor armónica con string skipping en las cuerdas 3 y 5', description: 'La menor armónica cayendo de la tercera cuerda a la quinta. La B queda sonando arriba antes del salto, como una tensión que se resuelve en los graves.' },
    { id: 'alternate-picking-skipping-07', low: 3, high: 1, from: 3, key: 'A', scale: 'harmonic', title: 'A menor armónica con string skipping en las cuerdas 3 y 1', description: 'En las agudas, la menor armónica suena árabe y clásica. La G# aparece en las dos octavas empujando hacia A, como en las frases de Malmsteen.' },
    { id: 'alternate-picking-skipping-08', low: 3, high: 1, from: 1, key: 'A', scale: 'harmonic', title: 'A menor armónica con string skipping en las cuerdas 1 y 3', description: 'El salto más exigente con la escala más dramática: de la primera cuerda a la tercera, con el tono y medio entre F y G# en el camino. Limpio, suena a solo neoclásico.' },
] as const;
const skipStudy = ({ low, high, from, key, scale, description }: typeof SKIP_PATTERNS[number]): PracticeStudy => {
    const { names, midi } = minorOnString(low, key, scale);
    const bars = [0, 1, 2, 3, 4, 5, 6, 7].map(start => {
        const grave = [0, 1, 2].map(step => note(low, midi(start + step)));
        const aguda = [0, 1, 2].map(step => note(high, midi(start + step) + 12));
        const cell = from === low ? [...grave, ...aguda] : [...aguda, ...grave];
        return { title: `Desde ${names[start % 7]}`, pattern: [0, 1, 2, 3, 1, 2, 3, 4, 2, 3, 4, 5, 3, 5, 4, 3].map(index => cell[index]) };
    });
    const skipped = (low + high) / 2;
    const to = from === low ? high : low;
    return {
        description,
        goal: 'Saltar una cuerda con la púa alternada sin perder el ritmo ni rozar la cuerda del medio, recorriendo la escala de forma horizontal.',
        steps: [
            `Cada compás usa seis notas: tres en la cuerda ${from} y las mismas tres, a una octava, en la cuerda ${to}. La cuerda ${skipped} no suena nunca.`,
            'Tócalas en grupos de cuatro: 1-2-3-4, 2-3-4-5, 3-4-5-6 y 4-6-5-4. Cada grupo cae en un pulso.',
            `El compás siguiente empieza en la nota que sigue de la escala: de ${key} hasta ${key} una octava más arriba, deslizando la mano por el mástil.`,
            `Al saltar, la púa pasa por encima de la cuerda ${skipped}: movimiento corto y preciso, sin levantar la mano.`,
            `Silencia la cuerda ${skipped} con la mano izquierda para que no suene si la rozas.`,
        ],
        mistakes: [`Rozar la cuerda ${skipped} al saltar.`, 'Romper la alternancia de la púa en el salto.', 'Hacer un movimiento grande con la mano derecha en lugar de uno corto.'],
        criterion: 'Cuando los ocho compases suenen parejos y la cuerda del medio no suene nunca, sube el BPM.',
        figure: 'semicorcheas',
        speed: 1,
        ...withSections(bars),
    };
};
// Pentatónica horizontal: la escala de corrido, de la sexta a la primera cuerda, con dos y tres notas por cuerda alternadas
// (2-3-2-3-2-3 = tres octavas). La tercera nota de cada cuerda llega con slide y deja la mano en la siguiente posición.
// Notas de Am (A C D E G); cada posición empieza en la nota siguiente de la sexta cuerda.
const OPEN_STRINGS = [64, 59, 55, 50, 45, 40]; // MIDI de la 1.ª a la 6.ª cuerda al aire
const AM_PENTATONIC = [0, 3, 5, 7, 10].map(step => (step + 9) % 12); // A C D E G
const HORIZONTAL_START_FRETS = [3, 5, 8, 10, 12]; // G, A, C, D, E en la sexta cuerda
const STRING_NAMES = ['', 'primera', 'segunda', 'tercera', 'cuarta', 'quinta', 'sexta'];
const HORIZONTAL_TEXT = [
    'La pentatónica deja la caja y cruza el mástil del traste 3 al 12: dos y tres notas por cuerda, con slides que te llevan de una posición a la siguiente.',
    'El mismo recorrido, ahora desde A en el traste 5. La digitación cambia: los slides caen en otras cuerdas y la mano termina más arriba del mástil.',
    'Arranca en C, en el traste 8, y sube hasta la zona aguda. Cada slide te deja en otra caja de la pentatónica sin cortar la frase.',
    'Desde D en el traste 10: el recorrido entra en la parte alta del mástil, donde los trastes se juntan y los slides piden más precisión.',
    'La última posición sale de E en el traste 12 y llega casi al final del mástil. Cierra el ciclo: ya puedes cruzar la pentatónica desde cualquier nota.',
];
const BLUE_NOTE = 3; // E♭, la quinta disminuida de Am
// Con blues, la blue note entra en la cuerda de la D, justo después de ella: el recorrido y los slides no cambian.
const HORIZONTAL_BLUES_TEXT = [
    'La posición horizontal I con la blue note: el E♭ aparece en cada octava y la línea que cruza el mástil del traste 3 al 12 ya suena a blues.',
    'Desde A en el traste 5, ahora con la blue note. Al cambiar la digitación, el E♭ cae en otras cuerdas y te obliga a ubicarlo de nuevo.',
    'Arranca en C, en el traste 8, con el E♭ entre cada D y E. Cada slide te lleva a otra caja y la blue note sigue el camino.',
    'Desde D en el traste 10: la blue note aparece apenas empiezas y le da tensión a la subida por la zona alta del mástil.',
    'La última posición sale de E en el traste 12 y llega casi al final del mástil, con la blue note en cada octava. Cierra el ciclo blues.',
];
const pentatonicHorizontalUp = (position: number, blues = false): PatternNote[] => {
    const pitches: number[] = [];
    for (let pitch = OPEN_STRINGS[5] + HORIZONTAL_START_FRETS[position - 1]; pitches.length < 15; pitch++) if (AM_PENTATONIC.includes(pitch % 12)) pitches.push(pitch);
    let at = 0;
    return [6, 5, 4, 3, 2, 1].flatMap(string => Array.from({ length: string % 2 === 0 ? 2 : 3 }, (_, index) => {
        const pitch = pitches[at++];
        const fret = pitch - OPEN_STRINGS[string - 1];
        const note = index === 2 ? slideTo(string, fret) : { string, fret };
        return blues && pitch % 12 === (BLUE_NOTE + 11) % 12 && at < pitches.length ? [note, { string, fret: fret + 1 }] : [note];
    }).flat());
};
// La bajada repite el camino al revés, también con slide en la tercera nota de cada cuerda. La última nota de la subida y
// la de la bajada duran el doble (una corchea): cada parte llena un compás de 4/4.
const pentatonicHorizontalStudy = (position: number, blues = false): PracticeStudy => {
    const up = pentatonicHorizontalUp(position, blues);
    // En la bajada el slide va a la tercera nota de la escala en cada cuerda; la blue note no cuenta.
    const down = [1, 2, 3, 4, 5, 6].flatMap(string => {
        let scaleIndex = 0;
        return up.filter(note => note.string === string).reverse().map(({ fret }) => {
            const blue = (OPEN_STRINGS[string - 1] + fret) % 12 === BLUE_NOTE;
            return !blue && scaleIndex++ === 2 ? slideTo(string, fret) : { string, fret };
        });
    });
    // Con blues van en sextillos y la última nota se alarga hasta cerrar el compás de 4/4 (son 17 o 18 notas).
    const last = (notes: PatternNote[]) => notes.map((note, index) => index === notes.length - 1 ? { ...note, beats: blues ? 4 - (notes.length - 1) / 6 : 0.5 } : note);
    const slides = (notes: PatternNote[]) => notes.filter(note => note.slide).map(note => `${notes[notes.indexOf(note) - 1].fret} a ${note.fret} en la ${STRING_NAMES[note.string]}`).join(', ');
    return {
        description: blues ? HORIZONTAL_BLUES_TEXT[position - 1] : HORIZONTAL_TEXT[position - 1],
        goal: blues
            ? 'Sumar la blue note al recorrido horizontal: el mismo camino por el mástil, pero con el E♭ que le da a la pentatónica el color del blues. Así lo tienes a mano en cualquier zona del mástil.'
            : position === 1
            ? 'Ver la pentatónica de otra manera: recorrer todo el mástil en una sola línea en vez de quedarte en una caja, para conectarla con otras escalas y con las demás posiciones.'
            : `Recorrer el mástil desde otra nota de la escala. El objetivo es el mismo, pero la digitación cambia: los slides caen en otros lugares y conectas otras cajas de la pentatónica.`,
        steps: [
            `Subida: dos notas en la sexta, tres en la quinta, dos en la cuarta, tres en la tercera, dos en la segunda y tres en la primera. La tercera nota de cada cuerda va con slide (${slides(up)}).`,
            blues
                ? `Todo va en sextillos. El ${up.at(-1)!.fret}/1 del final de la subida y el ${up[0].fret}/6 del final de la bajada se sostienen hasta cerrar el compás.`
                : `El ${up.at(-1)!.fret}/1 del final de la subida y el ${up[0].fret}/6 del final de la bajada duran el doble: una corchea.`,
            `Bajada: el mismo camino al revés, con slide en la tercera nota de cada cuerda (${slides(down)}).`,
            ...(blues ? ['La blue note (E♭) va justo después de cada D, en la misma cuerda y un traste más arriba: pásala rápido, es una nota de paso.'] : []),
            'Después de cada slide la mano ya quedó en la nueva posición: no regreses.',
        ],
        mistakes: ['Atacar con púa la nota del slide.', 'Que el slide se coma el tiempo de la nota: llega a tiempo, no antes.', 'Mirar la mano en cada cambio de posición en vez de sentir la distancia.'],
        criterion: 'Toca la subida y la bajada de corrido, con los slides limpios y a tiempo. Sube el BPM cuando no dudes en ningún cambio de posición.',
        figure: blues ? 'sextillos' : 'semicorcheas',
        speed: 1,
        perRow: up.length, // un compás por fila
        ...withSections([{ title: 'Subida', pattern: last(up) }, { title: 'Bajada', pattern: last(down) }]),
    };
};
// Pentatónicas modales de C menor (C eólico), en el orden de sus grados: cada modo toma la pentatónica mayor o menor (según
// su tercera) con una nota cambiada por su nota de color. Se tocan en caja vertical: arrancan en la tónica de la quinta
// cuerda y suben hasta la primera sin salir de la posición (un traste atrás y tres adelante de la tónica).
export const MODAL_PENTATONICS = [
    { id: 'pentatonic-modal-01', root: 'C', fret: 3, mode: 'eólica', steps: [0, 3, 5, 7, 8], names: 'C Eb F G Ab', color: 'la b6 (Ab)', description: 'La menor de siempre con la b6 en lugar de la b7: más dramática y melancólica, con el Ab cayendo sobre el G. Es la base de los demás modos.' },
    { id: 'pentatonic-modal-02', root: 'D', fret: 5, mode: 'locria', steps: [0, 3, 5, 6, 10], names: 'D F G Ab C', color: 'la b5 (Ab)', description: 'La más inestable: menor con la b5 que no deja descansar el oído. Tensión pura para frases oscuras y disonantes.' },
    { id: 'pentatonic-modal-03', root: 'Eb', fret: 6, mode: 'jónica', steps: [0, 4, 5, 7, 11], names: 'Eb G Ab Bb D', color: 'la 7 mayor (D)', description: 'La pentatónica mayor con la 7 mayor en lugar de la 6: brillante y abierta, con el semitono D–Eb empujando siempre hacia la tónica.' },
    { id: 'pentatonic-modal-04', root: 'F', fret: 8, mode: 'dórica', steps: [0, 3, 5, 7, 9], names: 'F Ab Bb C D', color: 'la 6 mayor (D)', description: 'Una pentatónica menor con la 6 mayor: el color de Santana y del funk. Suena a menor, pero sin tristeza y con un punto de luz.' },
    { id: 'pentatonic-modal-05', root: 'G', fret: 10, mode: 'frigia', steps: [0, 1, 5, 7, 10], names: 'G Ab C D F', color: 'la b2 (Ab)', description: 'Menor y oscura, con la b2 pegada a la tónica: suena española y metalera desde la primera nota de la caja.' },
    { id: 'pentatonic-modal-06', root: 'Ab', fret: 11, mode: 'lidia', steps: [0, 4, 6, 7, 11], names: 'Ab C D Eb G', color: 'la #4 (D)', description: 'Mayor y flotante: la #4 le da ese aire de banda sonora y de Steve Vai. Cinco notas que suenan a sueño, no a rock.' },
    { id: 'pentatonic-modal-07', root: 'Bb', fret: 13, mode: 'mixolidia', steps: [0, 2, 4, 7, 10], names: 'Bb C D F Ab', color: 'la b7 (Ab)', description: 'La pentatónica dominante: mayor con b7, el sonido del blues y del rock clásico sobre un acorde de séptima.' },
] as const;
// Cada nota va en la cuerda más grave donde entra en la caja. La última de la subida y la de la bajada se sostienen hasta
// cerrar el compás de 4/4 (son 9 o 10 semicorcheas).
const modalPentatonicUp = ({ fret: rootFret, steps }: typeof MODAL_PENTATONICS[number]): PatternNote[] => {
    const root = OPEN_STRINGS[4] + rootFret;
    const notes: PatternNote[] = [];
    for (let pitch = root, string = 5; ; pitch++) {
        if (!(steps as readonly number[]).includes((pitch - root) % 12)) continue;
        while (pitch - OPEN_STRINGS[string - 1] > rootFret + 3 && string > 1) string--;
        const fret = pitch - OPEN_STRINGS[string - 1];
        if (fret > rootFret + 3) return notes;
        notes.push({ string, fret });
    }
};
const modalPentatonicStudy = (item: typeof MODAL_PENTATONICS[number]): PracticeStudy => {
    const { root, fret, mode, color, description } = item;
    const up = modalPentatonicUp(item);
    const hold = (notes: PatternNote[]) => notes.map((note, index) => index === notes.length - 1 ? { ...note, beats: 4 - (notes.length - 1) / 4 } : note);
    return {
        description,
        goal: `Escuchar el color del modo ${mode.replace(/a$/, 'o')} en solo cinco notas, dentro de una caja: ${color} es la nota que lo hace sonar distinto de la pentatónica de siempre.`,
        steps: [
            `Arranca en ${root}, traste ${fret} de la quinta cuerda, y sube hasta la primera sin mover la mano: la caja va del traste ${fret - 1} al ${fret + 3}.`,
            'Un dedo por traste: el índice cubre el traste de atrás y el meñique el último.',
            `La bajada es el mismo camino al revés. La última nota de cada parte se sostiene hasta cerrar el compás.`,
            `Marca ${color} cada vez que aparece: es el color del modo.`,
        ],
        mistakes: ['Mover la mano en vez de estirar los dedos.', 'Pasar por la nota de color sin escucharla.', 'Dejar sonar dos notas de la misma cuerda a la vez.'],
        criterion: 'Toca la subida y la bajada de corrido y parejas. Sube el BPM cuando reconozcas la nota de color sin pensarla.',
        figure: 'semicorcheas',
        speed: 1,
        ...withSections([{ title: 'Subida', pattern: hold(up) }, { title: 'Bajada', pattern: hold([...up].reverse()) }]),
    };
};
// Pentatónica interválica: el recorrido horizontal I (Am desde G, del 3/6 al 12/1) tocado por saltos en vez de nota por
// nota. Cada nota va con la que está `skip` lugares más arriba en la escala (2 = cuartas, 3 = quintas, 4 = séptimas), en zigzag:
// un grupo sube y el siguiente baja, que es lo que mejor suena.
// La última nota de cada parte se sostiene hasta cerrar el compás.
const INTERVAL_ROUTE: PatternNote[] = pentatonicHorizontalUp(1).map(({ string, fret }) => ({ string, fret }));
const at = (index: number, down: boolean) => INTERVAL_ROUTE[down ? INTERVAL_ROUTE.length - 1 - index : index];
const intervalPairs = (skip: number, count: number, down: boolean, zigzag = false) => Array.from({ length: count }, (_, k) => {
    const pair = [at(k, down), at(k + skip, down)];
    return zigzag && k % 2 ? pair.reverse() : pair;
}).flat();
const closing = (from: number, down: boolean) => Array.from({ length: INTERVAL_ROUTE.length - from }, (_, k) => at(from + k, down));
const held = (notes: PatternNote[], beats: number) => notes.map((note, index) => index === notes.length - 1 ? { ...note, beats } : note);
type IntervalLesson = { id: string; title: string; difficulty: Difficulty; figure: Figure; description: string; goal: string; build: (down: boolean) => PatternNote[]; steps: string[]; mistakes: string[] };
export const INTERVAL_PENTATONICS: IntervalLesson[] = [
    {
        id: 'pentatonic-intervals-01', title: 'Pentatónica en cuartas', difficulty: 'intermedio', figure: 'semicorcheas',
        description: 'La pentatónica en cuartas y en zigzag: un par sube y el siguiente baja. Casi todas caen en el mismo traste de dos cuerdas vecinas y suenan a frase, no a ejercicio.',
        goal: 'Cambiar de dirección en cada par sin perder la púa alternada: la mano derecha cruza las cuerdas hacia arriba y hacia abajo todo el tiempo.',
        build: down => [...intervalPairs(2, 12, down, true), at(14, down)],
        steps: ['Primer par hacia arriba, el siguiente hacia abajo, y así todo el recorrido.', 'La púa alternada no se reinicia: en los pares que bajan cruzas la cuerda con púa arriba.', 'Casi todas las cuartas caen en el mismo traste de dos cuerdas vecinas: aplana el dedo o rueda la yema para no dejar sonar las dos.'],
        mistakes: ['Volver a la dirección de siempre sin darte cuenta.', 'Reiniciar la púa con un golpe abajo en cada par.', 'Dejar sonar las dos notas del mismo traste.'],
    },
    {
        id: 'pentatonic-intervals-02', title: 'Pentatónica en quintas', difficulty: 'intermedio', figure: 'semicorcheas',
        description: 'Quintas en zigzag: cada nota salta tres lugares en la escala, un par sube y el siguiente baja. La forma del power chord dentro de la escala, con sonido de riff.',
        goal: 'Tocar la pentatónica con el peso de las quintas y reconocer la forma del power chord dentro de la escala en todo el mástil.',
        build: down => [...intervalPairs(3, 11, down, true), ...closing(12, down)],
        steps: ['Cada par: una nota y la que está tres lugares más arriba en la escala. Un par sube y el siguiente baja.', 'La mayoría tiene la forma del power chord: cuerda vecina, dos trastes más arriba.', 'Al final cierras con tres notas seguidas de la escala.'],
        mistakes: ['Dejar sonar las dos notas como un acorde.', 'Mover toda la mano en cada par en vez de estirar los dedos.', 'Perder la púa alternada al cruzar de cuerda.'],
    },
    {
        id: 'pentatonic-intervals-03', title: 'Pentatónica en séptimas', difficulty: 'avanzado', figure: 'semicorcheas',
        description: 'Saltos de cuatro lugares en la escala, un par sube y el siguiente baja: séptimas y sextas en zigzag, el sonido angular de Holdsworth y Greg Howe.',
        goal: 'Sacar el sonido de la fusión de la pentatónica de siempre: saltos amplios, cambios de dirección y saltos de cuerda con la púa precisa.',
        build: down => [...intervalPairs(4, 11, down, true), ...closing(12, down)],
        steps: ['Cada par: una nota y la que está cuatro lugares más arriba. Un par sube y el siguiente baja.', 'Varios pares saltan una cuerda: silencia la del medio con la mano izquierda.', 'Al final cierras con tres notas seguidas de la escala.'],
        mistakes: ['Rozar la cuerda que saltas.', 'Perder la púa alternada en los saltos.', 'Volver a tocar los pares siempre hacia arriba.'],
    },
];
const intervalStudy = ({ figure, description, goal, build, steps, mistakes }: IntervalLesson): PracticeStudy => ({
    description,
    goal,
    steps: [...steps, 'Bajada: el mismo recorrido desde el 12/1 hasta el 3/6.'],
    mistakes,
    criterion: 'Toca la subida y la bajada de corrido, con cada salto limpio y sin notas que se mezclen. Sube el BPM cuando no dudes en ningún salto.',
    figure,
    speed: 1,
    perRow: 16, // un compás por fila
    ...withSections([{ title: 'Subida', pattern: held(build(false), 2) }, { title: 'Bajada', pattern: held(build(true), 2) }]),
});
// Tapping: celdas de tres notas en tresillos, tap (T), pull-off (p) y hammer-on (h). En cada cuerda van las notas 1, 3 y 5
// desde un grado de la escala (una tríada): la mano izquierda toma las dos graves y el tap la aguda.
const NATURAL_MINOR = { steps: [0, 2, 3, 5, 7, 8, 10], names: { G: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'], A: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], C: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'] } };
const TAPPING_TONICS = { G: 7, A: 9, C: 0 };
/** Grados de la menor natural desde la tónica más grave de la cuerda `string` (índice 0 = tónica). */
const tappingMinor = (string: number, key: keyof typeof TAPPING_TONICS) => {
    const tonic = OPEN_MIDI[string - 1] + (TAPPING_TONICS[key] - OPEN_MIDI[string - 1] % 12 + 12) % 12;
    return (index: number) => tonic + NATURAL_MINOR.steps[index % 7] + Math.floor(index / 7) * 12;
};
/** Una celda T-p-h: tap en la nota aguda, pull-off a la grave y hammer-on a la del medio. */
const tapCell = (string: number, [low, mid, high]: number[]): PatternNote[] => [{ ...note(string, high), tap: true }, note(string, low), note(string, mid)];
const repeat = (cell: PatternNote[], times: number) => Array.from({ length: times }, () => cell).flat();
const triad = (scale: (index: number) => number, degree: number) => [degree, degree + 2, degree + 4].map(scale);
const TAPPING_STEPS = [
    'Cada celda tiene tres notas en la misma cuerda: tap con la mano derecha en la aguda (T), pull-off a la grave (p) y hammer-on a la del medio (h).',
    'La mano izquierda deja los dos dedos listos en sus trastes antes del tap: el pull-off sale de la uña del dedo que tapea, tirando la cuerda hacia el piso.',
];
const TAPPING_MISTAKES = ['Que el tap suene más fuerte que el pull-off y el hammer-on.', 'Dejar sonar las cuerdas que no tocas: apoya la palma derecha sobre las graves.', 'Correr en el tap y llegar tarde al hammer-on.'];

export const TAPPING_ONE_STRING = [
    { id: 'tapping-one-string-01', string: 1, key: 'G', title: 'Gm · cuerda 1', description: 'El primer paso del tapping: la tríada de G menor en la primera cuerda, en tres posiciones que suben por el mástil. Tres notas que suenan a solo desde el primer tap.' },
    { id: 'tapping-one-string-02', string: 3, key: 'A', title: 'Am · cuerda 3', description: 'La misma idea en la tercera cuerda con A menor: la cuerda es más gruesa, el tap pide más firmeza y hay que callar las cuerdas de alrededor.' },
    { id: 'tapping-one-string-03', string: 5, key: 'C', title: 'Cm · cuerda 5', description: 'C menor en la quinta cuerda: tapping en los graves, con un sonido grueso de riff. La cuerda vibra más, así que el control de los pull-offs se nota en cada nota.' },
] as const;
const tappingOneStringStudy = ({ string, key, description }: typeof TAPPING_ONE_STRING[number]): PracticeStudy => {
    const scale = tappingMinor(string, key);
    // Tríada en posición fundamental y sus dos inversiones: 1-3-5, 3-5-1 y 5-1-3.
    // Subida: grave, media y tap (3-6-10 en G). Bajada: media, grave y tap (6-3-10), con dos pull-offs seguidos del tap:
    // así el giro no repite el tap y cada compás sigue al anterior sin cortes.
    const degrees = [[0, 2, 4], [2, 4, 7], [4, 7, 9]];
    const cells = degrees.map(position => tapCell(string, position.map(scale)));
    const up = cells.map(([tap, low, mid]) => [low, mid, tap]);
    const down = cells.map(([tap, low, mid]) => [mid, low, tap]);
    const frets = (cell: PatternNote[]) => cell.map(n => n.fret).join('–');
    return {
        description,
        goal: 'Coordinar las dos manos en una sola cuerda: el tap, el pull-off y el hammer-on parejos y a tiempo, y cambiar de posición sin cortar el ritmo.',
        steps: [
            'Cada celda tiene tres notas en la misma cuerda: dos con la mano izquierda y una con tap de la mano derecha (T). En la tablatura, p es pull-off y h es hammer-on.',
            TAPPING_STEPS[1],
            `De subida, cada celda va de la grave al tap: ${frets(up[0])}, ${frets(up[1])} y ${frets(up[2])}. Hammer-on a la del medio y tap en la aguda.`,
            `De bajada, cada celda baja con dos pull-offs y cierra con el tap: ${frets(down[2])}, ${frets(down[1])} y ${frets(down[0])}. El tap nunca se repite: después de cada tap viene un pull-off.`,
            'Cada posición se repite cuatro veces, un compás.',
        ],
        mistakes: TAPPING_MISTAKES,
        criterion: 'Cuando las tres posiciones suenen parejas y los cambios no corten el pulso, sube el BPM.',
        figure: 'tresillos',
        speed: 1,
        perRow: 12, // un compás por fila
        picking: 'tapping',
        ...withSections([
            { title: 'Subida · posición 1', pattern: repeat(up[0], 4) },
            { title: 'Subida · posición 2', pattern: repeat(up[1], 4) },
            { title: 'Subida · posición 3', pattern: repeat(up[2], 4) },
            { title: 'Bajada · posición 3', pattern: repeat(down[2], 4) },
            { title: 'Bajada · posición 2', pattern: repeat(down[1], 4) },
            { title: 'Bajada · posición 1', pattern: repeat(down[0], 4) },
        ]),
    };
};

// Dos cuerdas: tríada desde un grado en la cuerda grave y desde la cuarta de ese grado en la aguda, que cae casi en los
// mismos trastes. Cada compás sube un grado, de la tónica a su octava.
export const TAPPING_TWO_STRINGS = [
    { id: 'tapping-two-strings-01', low: 2, high: 1, key: 'C', down: false, title: 'Cm subiendo · cuerdas 2 y 1', description: 'El tapping cruza de cuerda: una tríada en la segunda y otra en la primera, casi en los mismos trastes. Cada compás sube un grado y la escala menor aparece en el mástil.' },
    { id: 'tapping-two-strings-02', low: 3, high: 2, key: 'A', down: false, title: 'Am subiendo · cuerdas 3 y 2', description: 'Entre la tercera y la segunda la afinación corre la forma un traste: el tap de la segunda cae uno más arriba y la mano derecha aprende a medir la distancia.' },
    { id: 'tapping-two-strings-03', low: 5, high: 4, key: 'C', down: false, title: 'Cm subiendo · cuerdas 5 y 4', description: 'Las dos cuerdas en los graves: el tapping suena oscuro y pesado, como un riff. Las cuerdas gruesas piden taps firmes y la palma callando lo que sobra.' },
    { id: 'tapping-two-strings-down-01', low: 2, high: 1, key: 'C', down: true, title: 'Cm bajando · cuerdas 2 y 1', description: 'El camino de vuelta: de C en la octava hasta C abajo, con la celda de la primera cuerda primero. Bajar con tapping pide que el tap encuentre cada posición nueva.' },
    { id: 'tapping-two-strings-down-02', low: 3, high: 2, key: 'A', down: true, title: 'Am bajando · cuerdas 3 y 2', description: 'A menor de bajada en las cuerdas 3 y 2: la segunda va primero y la forma corrida un traste se siente distinta cuando la mano retrocede por el mástil.' },
    { id: 'tapping-two-strings-down-03', low: 5, high: 4, key: 'C', down: true, title: 'Cm bajando · cuerdas 5 y 4', description: 'La bajada en los graves: de la octava a la tónica con la cuarta cuerda primero. Suena a riff que cae, y los taps en cuerdas gruesas piden firmeza al retroceder.' },
] as const;
const tappingTwoStringStudy = ({ low, high, key, down, description }: typeof TAPPING_TWO_STRINGS[number]): PracticeStudy => {
    // Las dos cuerdas usan la misma escala (desde la tónica de la grave): en la aguda, la tríada empieza tres grados arriba.
    const scale = tappingMinor(low, key);
    const names = NATURAL_MINOR.names[key];
    // Subida: de la tónica a su octava, primero la cuerda grave. Bajada (lección aparte): de la octava a la tónica,
    // primero la aguda.
    const bars = (down ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]).map(start => {
        const cells = [tapCell(low, triad(scale, start)), tapCell(high, triad(scale, start + 3))];
        return { title: `Desde ${names[start % 7]}`, pattern: repeat((down ? cells.reverse() : cells).flat(), 2) };
    });
    return {
        description,
        goal: 'Llevar el tapping a dos cuerdas: cambiar de cuerda con las dos manos a la vez y recorrer la escala de forma horizontal.',
        steps: [
            ...TAPPING_STEPS,
            'Cada compás tiene dos celdas: una en la cuerda de abajo y otra en la de arriba, y se repiten dos veces.',
            down
                ? `Cada compás empieza en la nota anterior de la escala: de ${key} una octava arriba hasta ${key}, en el traste ${scale(0) - OPEN_MIDI[low - 1]}. La celda de la cuerda aguda va primero.`
                : `Cada compás empieza en la nota que sigue de la escala: de ${key}, en el traste ${scale(0) - OPEN_MIDI[low - 1]}, hasta ${key} una octava más arriba. La celda de la cuerda grave va primero.`,
            'Al cambiar de cuerda, la mano izquierda ya está puesta: el tap llega a la cuerda nueva sin mirar.',
        ],
        mistakes: [...TAPPING_MISTAKES, 'Tapear la cuerda equivocada al cruzar.'],
        criterion: 'Cuando los ocho compases suenen parejos y los cruces de cuerda no se noten, sube el BPM.',
        figure: 'tresillos',
        speed: 1,
        perRow: 12,
        picking: 'tapping',
        ...withSections(bars),
    };
};

// String skipping: la misma tríada en la cuerda grave y una octava arriba en la aguda, saltando la cuerda del medio.
// `from` es la cuerda por la que empieza cada compás.
export const TAPPING_SKIPS = [
    { id: 'tapping-skipping-01', low: 5, high: 3, from: 5, key: 'C', title: 'Cm · de la 5 a la 3', description: 'La tríada en la quinta y la misma una octava arriba en la tercera, saltando la cuarta. El tapping se abre y empieza a sonar a solo de verdad.' },
    { id: 'tapping-skipping-02', low: 5, high: 3, from: 3, key: 'C', title: 'Cm · de la 3 a la 5', description: 'Las mismas notas, pero cada compás empieza en la tercera cuerda y cae a la quinta. El salto va de agudo a grave y las dos manos lo sienten distinto.' },
    { id: 'tapping-skipping-03', low: 3, high: 1, from: 3, key: 'A', title: 'Am · de la 3 a la 1', description: 'El salto en las agudas, donde el tapping brilla: entre la tercera y la primera la octava queda tres trastes adelante y el tap tiene que encontrarla.' },
    { id: 'tapping-skipping-04', low: 3, high: 1, from: 1, key: 'A', title: 'Am · de la 1 a la 3', description: 'Cada compás nace en la primera cuerda y salta a la tercera, pasando por encima de la segunda sin tocarla. El salto más incómodo, y el que más suena.' },
] as const;
const tappingSkipStudy = ({ low, high, from, key, description }: typeof TAPPING_SKIPS[number]): PracticeStudy => {
    const scale = tappingMinor(low, key);
    const octave = (index: number) => scale(index) + 12;
    const names = NATURAL_MINOR.names[key];
    const skipped = (low + high) / 2;
    const to = from === low ? high : low;
    // Seis compases: la octava aguda pasaría del traste 22.
    const bars = [0, 1, 2, 3, 4, 5].map(start => {
        const [grave, aguda] = [tapCell(low, triad(scale, start)), tapCell(high, triad(octave, start))];
        return { title: `Desde ${names[start % 7]}`, pattern: repeat(from === low ? [...grave, ...aguda] : [...aguda, ...grave], 2) };
    });
    return {
        description,
        goal: 'Saltar una cuerda con el tapping sin rozar la del medio, con la misma tríada en dos octavas.',
        steps: [
            ...TAPPING_STEPS,
            `Cada compás tiene la tríada en la cuerda ${from} y la misma, una octava arriba o abajo, en la cuerda ${to}. La cuerda ${skipped} no suena nunca.`,
            `El compás siguiente empieza en la nota que sigue de la escala: de ${key} hasta ${names[5]}, subiendo por el mástil.`,
            `Silencia la cuerda ${skipped} con la mano izquierda y la palma derecha.`,
        ],
        mistakes: [...TAPPING_MISTAKES, `Rozar la cuerda ${skipped} en el salto.`],
        criterion: 'Cuando los seis compases suenen parejos y la cuerda del medio no suene nunca, sube el BPM.',
        figure: 'tresillos',
        speed: 1,
        perRow: 12,
        picking: 'tapping',
        ...withSections(bars),
    };
};

// Escalas simétricas en todas las cuerdas: de la sexta a la primera (6-5-4-3-2-1) o con salto de cuerdas (6-4-5-3-4-2-3-1).
// En cada cuerda, la misma forma de la escala (desde C) en el primer traste desde el 7 donde entra. Solo de subida: grave,
// media y tap, una vez por cuerda.
const SYMMETRIC_TAPPING = [
    { key: 'tonal', label: 'Tonal', shape: [0, 2, 4], steps: [0, 2, 4, 6, 8, 10], names: 'C D E F# G# A#' },
    { key: 'diminished', label: 'Disminuida', shape: [0, 2, 3], steps: [0, 2, 3, 5, 6, 8, 9, 11], names: 'C D Eb F Gb Ab A B' },
] as const;
const SYMMETRIC_ORDERS = { horizontal: [6, 5, 4, 3, 2, 1], skipping: [6, 4, 5, 3, 4, 2, 3, 1] } as const;
export const TAPPING_SYMMETRIC = [
    { id: 'tapping-symmetric-03', scale: SYMMETRIC_TAPPING[0], order: 'horizontal', title: 'Tonal · seis cuerdas', description: 'La escala tonal de la sexta a la primera cuerda: la misma forma en cada cuerda y un sonido que flota y nunca resuelve. Con tapping sube como una cascada.' },
    { id: 'tapping-symmetric-04', scale: SYMMETRIC_TAPPING[1], order: 'horizontal', title: 'Disminuida · seis cuerdas', description: 'La disminuida cuerda por cuerda, de la sexta a la primera: la misma forma en todas, oscura y tensa, como una escalera que sube sin llegar nunca.' },
    { id: 'tapping-symmetric-01', scale: SYMMETRIC_TAPPING[0], order: 'skipping', title: 'Tonal · salto de cuerdas', description: 'La escala tonal saltando cuerdas de la sexta a la primera: la misma forma en cada cuerda y un sonido que flota y nunca resuelve. Con tapping se vuelve una cascada.' },
    { id: 'tapping-symmetric-02', scale: SYMMETRIC_TAPPING[1], order: 'skipping', title: 'Disminuida · salto de cuerdas', description: 'La disminuida saltando cuerdas: la misma forma en cada cuerda, oscura y tensa como una escalera que nunca llega. Es el sonido del metal neoclásico.' },
] as const;
const tappingSymmetricStudy = ({ scale: { shape, steps }, order, description }: typeof TAPPING_SYMMETRIC[number]): PracticeStudy => {
    const strings = SYMMETRIC_ORDERS[order];
    const inScale = (midi: number) => (steps as readonly number[]).includes(midi % 12);
    const cell = (string: number) => {
        let fret = 7;
        while (!shape.every(step => inScale(OPEN_MIDI[string - 1] + fret + step))) fret++;
        const [tap, low, mid] = tapCell(string, shape.map(step => OPEN_MIDI[string - 1] + fret + step));
        return [low, mid, tap];
    };
    const notes = strings.flatMap(cell);
    // Seis cuerdas son 18 notas (seis pulsos): el último tap se sostiene hasta cerrar el segundo compás.
    const pattern = notes.length % 12 ? notes.map((note, index) => index === notes.length - 1 ? { ...note, beats: 1 / 3 + (12 - notes.length % 12) / 3 } : note) : notes;
    return {
        description,
        goal: 'Llevar el tapping a todas las cuerdas con la misma forma en cada una y escuchar el color simétrico de la escala.',
        steps: [
            'Cada celda tiene tres notas en la misma cuerda: la grave, hammer-on a la del medio y tap en la aguda (T).',
            TAPPING_STEPS[1],
            `Las cuerdas van en este orden: ${strings.join('-')}. Una celda por cuerda y pasas a la siguiente.`,
            `La forma es la misma en todas las cuerdas: ${cell(6).map(n => n.fret).join('–')} en la sexta. Solo se corre un traste en algunas cuerdas para quedarse en la escala.`,
            order === 'skipping' ? 'Silencia las cuerdas que saltas con la palma derecha y los dedos libres de la izquierda.' : 'Al cambiar de cuerda, la mano izquierda ya está puesta: el hammer-on de la cuerda nueva sale sin púa.',
        ],
        mistakes: order === 'skipping' ? [...TAPPING_MISTAKES, 'Rozar la cuerda que saltas.'] : TAPPING_MISTAKES,
        criterion: 'Cuando todas las celdas suenen parejas y los cambios de cuerda no se noten, sube el BPM.',
        figure: 'tresillos',
        speed: 2,
        perRow: 12,
        picking: 'tapping',
        ...withSections([{ title: 'Subida', pattern }]),
    };
};

// Ráfagas: C jónico y C menor a cuatro notas por cuerda desde C en la quinta cuerda (traste 3): tres notas con la mano izquierda y una con
// tap. Cada cuerda sigue la escala donde terminó la anterior, así que la forma sube por el mástil. Dos lecciones: la subida
// (de la quinta a la primera, tap al final) y la bajada (de la primera a la quinta, tap al inicio y tres pull-offs).
const BURST_SCALES = {
    major: { label: 'C jónico', steps: [0, 2, 4, 5, 7, 9, 11], names: 'C D E F G A B' },
    minor: { label: 'C menor', steps: [0, 2, 3, 5, 7, 8, 10], names: 'C D Eb F G Ab Bb' },
};
export const TAPPING_FOUR_NOTES = [
    { id: 'tapping-four-notes-01', title: 'C jónico · subida', scale: 'major', down: false, description: 'C jónico a cuatro notas por cuerda, de la quinta a la primera: tres hammer-ons con la izquierda y la cuarta con tap. Una escalera que cruza el mástil hacia arriba.' },
    { id: 'tapping-four-notes-02', title: 'C jónico · bajada', scale: 'major', down: true, description: 'C jónico a cuatro notas por cuerda, de la primera a la quinta: el tap abre cada cuerda y tres pull-offs la cierran. Una cascada que baja por todo el mástil.' },
    { id: 'tapping-four-notes-03', title: 'C menor · subida', scale: 'minor', down: false, description: 'La ráfaga en C menor, de la quinta a la primera: tres hammer-ons y un tap por cuerda. El mismo recorrido de la jónica, ahora oscuro y dramático.' },
    { id: 'tapping-four-notes-04', title: 'C menor · bajada', scale: 'minor', down: true, description: 'C menor cayendo de la primera a la quinta: tap y tres pull-offs por cuerda. Una ráfaga melancólica que baja por el mástil y termina en la tónica.' },
] as const;
const tappingFourNotes = ({ scale: key, down, description }: typeof TAPPING_FOUR_NOTES[number]): PracticeStudy => {
    const { label, steps } = BURST_SCALES[key];
    const scale = (index: number) => 48 + steps[index % 7] + Math.floor(index / 7) * 12; // C en el traste 3 de la quinta
    const strings = [5, 4, 3, 2, 1].map((string, at) => [0, 1, 2, 3].map(step => note(string, scale(at * 4 + step))));
    const notes = down
        ? [...strings].reverse().flatMap(cell => [{ ...cell[3], tap: true }, cell[2], cell[1], cell[0]])
        : strings.flatMap(cell => [...cell.slice(0, 3), { ...cell[3], tap: true }]);
    // 20 notas son cinco pulsos: la última se sostiene hasta cerrar el segundo compás (32 semicorcheas).
    const pattern = notes.map((n, index) => index === notes.length - 1 ? { ...n, beats: (32 - notes.length + 1) / 4 } : n);
    const frets = (cells: PatternNote[][]) => cells.map(cell => cell.map(n => n.fret).join('-')).join(', ');
    return {
        description,
        goal: `${down ? 'Bajar' : 'Subir'} por ${label} con tapping a cuatro notas por cuerda, cruzando el mástil sin cortar el ritmo.`,
        steps: down
            ? [
                `En cada cuerda, tap en la nota más aguda y pull-offs por las tres de la mano izquierda: ${frets([...strings].reverse().map(cell => [...cell].reverse()))}.`,
                'Cada cuerda empieza en la nota anterior de la escala, así que la mano izquierda baja por el mástil.',
                'Una cuerda por pulso: el tap cae en el tiempo. La C final se sostiene hasta cerrar el compás.',
                'Es más fácil que la subida: el tap hace sonar la cuerda y los pull-offs solo aprovechan esa vibración.',
            ]
            : [
                `En cada cuerda, tres notas con la mano izquierda (hammer-on) y la cuarta con tap: ${frets(strings)}.`,
                'Cada cuerda empieza en la nota que sigue de la escala, así que la mano izquierda sube por el mástil.',
                'Una cuerda por pulso: la primera nota de cada cuerda cae en el tiempo. El tap final se sostiene hasta cerrar el compás.',
                'Es la más difícil de las dos: la fuerza sale de la mano izquierda. Cada hammer-on, sobre todo el primero de cada cuerda, tiene que sonar igual de fuerte que el tap.',
            ],
        mistakes: ['Que el tap pise la nota de la mano izquierda, que queda muy cerca.', 'Correr en los cambios de cuerda.', 'Dejar sonar las cuerdas que ya tocaste.'],
        criterion: `Cuando la ${down ? 'bajada' : 'subida'} suene de corrido y pareja, sube el BPM.`,
        figure: 'semicorcheas',
        speed: 2, // 80 BPM
        perRow: 16,
        picking: 'tapping',
        ...withSections([{ title: down ? 'Bajada' : 'Subida', pattern }]),
    };
};
export const practiceStudies: Record<string, PracticeStudy> = {
    ...Object.fromEntries(TAPPING_FOUR_NOTES.map(item => [item.id, tappingFourNotes(item)])),
    ...Object.fromEntries(TAPPING_ONE_STRING.map(item => [item.id, tappingOneStringStudy(item)])),
    ...Object.fromEntries(TAPPING_TWO_STRINGS.map(item => [item.id, tappingTwoStringStudy(item)])),
    ...Object.fromEntries(TAPPING_SKIPS.map(item => [item.id, tappingSkipStudy(item)])),
    ...Object.fromEntries(TAPPING_SYMMETRIC.map(item => [item.id, tappingSymmetricStudy(item)])),
    ...Object.fromEntries(SKIP_PATTERNS.map(pattern => [pattern.id, skipStudy(pattern)])),
    ...Object.fromEntries(TWO_STRING_PATTERNS.map(pattern => [pattern.id, twoStringStudy(pattern)])),
    ...Object.fromEntries(OCTAVE_MODES.map(mode => [mode.id, octaveShape(mode)])),
    'alternate-picking-right-hand-01': rightHandOpen,
    'alternate-picking-right-hand-02': rightHandSkip,
    ...Object.fromEntries(SCALE_MODES.map(mode => [mode.id, modeStudy(mode)])),
    ...Object.fromEntries(SYMMETRIC_SCALES.map(scale => [scale.id, symmetricStudy(scale)])),
    'fingering-01': {
        description: 'El ejercicio que todos los guitarristas han tocado, y por algo: despierta los cuatro dedos, los vuelve independientes y enseña a la mano a moverse por todo el mástil.',
        goal: 'Soltar los dedos. Cada posición se siente distinta: abajo los trastes están más separados y arriba más juntos, así que la mano tiene que adaptarse a cada zona.',
        steps: ['Dedos 1, 2, 3 y 4 = índice, medio, anular y meñique, un dedo por traste. En la primera posición van en los trastes 1, 2, 3 y 4.', 'Toca 1–2–3–4 en cada cuerda desde la sexta hasta la primera. De regreso, desde la primera hasta la sexta, toca igual 1–2–3–4.', 'Al terminar la vuelta, sube la mano: posición 5 (trastes 5–8), luego 7 (trastes 7–10) y finalmente 12 (trastes 12–15).', 'Púa alternada continua, a tempo con el metrónomo. Elige una velocidad a la que puedas tocar todo limpio, no la más rápida.'],
        mistakes: ['Apretar de más en la primera posición, donde los trastes están más separados.', 'Amontonar los dedos en el traste 12, donde el espacio es menor.', 'Levantar mucho los dedos o mover toda la mano en cada nota.'],
        criterion: 'Recorre las cuatro posiciones sin pararte en los cambios y sin zumbidos. Sube la velocidad solo cuando todas suenen igual de limpias.',
        figure: 'corcheas',
        speed: 1,
        ...withSections(chromaticPositions.map(([title, position]) => ({ title, pattern: chromaticAt(position) }))),
    },
    'fingering-02': {
        description: 'El mismo cromático, pero empezando por el meñique: el dedo más débil lleva la iniciativa. Es incómodo al principio, y justamente por eso funciona.',
        goal: 'No es lo mismo tocar empezando por el meñique que por el índice. Desarrolla fuerza y control en ambas posturas, hasta que el 4–3–2–1 suene tan parejo como el 1–2–3–4.',
        steps: ['Coloca los cuatro dedos antes de empezar: índice, medio, anular y meñique en los trastes 1, 2, 3 y 4.', 'Toca 4–3–2–1 en cada cuerda desde la sexta hasta la primera. De regreso, desde la primera hasta la sexta, toca igual 4–3–2–1.', 'Empezar por el meñique exige que el resto de dedos ya esté apoyado: al tocar el 4, los dedos 1, 2 y 3 esperan sobre sus trastes y se van soltando uno a uno.', 'Al terminar la vuelta, sube la mano: posición 5 (trastes 5–8), luego 7 (trastes 7–10) y finalmente 12 (trastes 12–15).', 'Púa alternada continua, a tempo con el metrónomo. Elige una velocidad a la que todo suene limpio.'],
        mistakes: ['Que el meñique suene más débil o más corto que los demás dedos.', 'Levantar todos los dedos a la vez en lugar de soltarlos de uno en uno.', 'Tensar la mano para sostener la postura en la primera posición.'],
        criterion: 'Recorre las cuatro posiciones sin pararte y con el mismo volumen en las cuatro notas. Compara con el 1–2–3–4: cuando suenen igual, sube la velocidad.',
        figure: 'corcheas',
        speed: 1,
        ...withSections(chromaticPositions.map(([title, position]) => ({ title, pattern: chromaticAt(position, [4, 3, 2, 1]) }))),
    },
    'fingering-03': {
        description: 'Aquí los dedos dejan de ir en fila. Al intercalarlos, el cerebro tiene que pensar cada movimiento y los dedos ganan independencia de verdad. Es como un trabalenguas para la mano izquierda.',
        goal: 'Romper el automatismo de tocar los dedos siempre en orden. Cada dedo tiene que moverse por su cuenta, sin arrastrar al de al lado.',
        steps: ['Un dedo por traste: índice, medio, anular y meñique en los trastes 1, 2, 3 y 4. El orden es 1–3–2–4: los números son dedos.', 'Toca 1–3–2–4 en cada cuerda desde la sexta hasta la primera. De regreso, desde la primera hasta la sexta, toca igual 1–3–2–4.', 'Al pasar del 3 al 2, deja el anular listo cerca de su traste; no lo levantes de más.', 'Al terminar la vuelta, sube la mano: posición 5 (trastes 5–8), luego 7 (trastes 7–10) y finalmente 12 (trastes 12–15).', 'Púa alternada continua, a tempo con el metrónomo. Elige una velocidad a la que no se te cambie el orden de los dedos.'],
        mistakes: ['Convertir el patrón sin darte cuenta en 1–2–3–4.', 'Dejar un dedo apoyado por encima del traste que debe sonar.', 'Mover la mano entera para alcanzar el salto del 1 al 3.'],
        criterion: 'Recorre las cuatro posiciones sin corregir la digitación a mitad del patrón. Sube la velocidad solo cuando el orden te salga sin pensarlo.',
        figure: 'corcheas',
        speed: 1,
        ...withSections(chromaticPositions.map(([title, position]) => ({ title, pattern: chromaticAt(position, [1, 3, 2, 4]) }))),
    },
    'fingering-04': {
        description: 'El trabalenguas más difícil: los dedos intercalados y empezando por el meñique. Si lo tocas limpio, tu mano izquierda ya está lista para casi cualquier digitación que te encuentres.',
        goal: 'Llevar la independencia de los dedos a la postura inversa. Empezar por el meñique y saltar entre dedos exige fuerza y control en toda la mano.',
        steps: ['Coloca los cuatro dedos antes de empezar: índice, medio, anular y meñique en los trastes 1, 2, 3 y 4. El orden es 4–2–3–1.', 'Toca 4–2–3–1 en cada cuerda desde la sexta hasta la primera. De regreso, desde la primera hasta la sexta, toca igual 4–2–3–1.', 'Al tocar el 4, los demás dedos esperan apoyados. Suelta solo lo necesario para que suene cada nota.', 'Al terminar la vuelta, sube la mano: posición 5 (trastes 5–8), luego 7 (trastes 7–10) y finalmente 12 (trastes 12–15).', 'Púa alternada continua, a tempo con el metrónomo. Elige una velocidad a la que todo suene limpio.'],
        mistakes: ['Que el meñique suene más débil que los demás dedos.', 'Levantar todos los dedos a la vez en lugar de soltarlos según el orden.', 'Cambiar el patrón sin querer a 4–3–2–1.'],
        criterion: 'Recorre las cuatro posiciones con el mismo volumen en las cuatro notas. Compara con el 1–3–2–4: cuando suenen igual, sube la velocidad.',
        figure: 'corcheas',
        speed: 1,
        ...withSections(chromaticPositions.map(([title, position]) => ({ title, pattern: chromaticAt(position, [4, 2, 3, 1]) }))),
    },
    'fingering-05': {
        description: 'Muchos licks piden abrir la mano más de lo normal. Este ejercicio la estira poco a poco, primero abajo y luego arriba. Ve con calma: ganar alcance, nunca forzar.',
        goal: 'Abrir la mano para cubrir cinco trastes sin moverla. En los primeros trastes la distancia es mayor, por eso cada posición exige un estiramiento distinto.',
        steps: ['Índice en el primer traste, dedo medio o anular en el tercero y meñique en el quinto. La mano no se desplaza: se abre.', 'Toca 1–3–5–3–5 en cada cuerda desde la sexta hasta la primera. De regreso, desde la primera hasta la sexta, toca igual 1–3–5–3–5.', 'Al terminar la vuelta, sube la mano: posición 5 (trastes 5–9), luego 7 (trastes 7–11) y finalmente 12 (trastes 12–16).', 'Púa alternada continua, a tempo con el metrónomo. Ve despacio: el estiramiento se gana con constancia, no con fuerza.'],
        mistakes: ['Mover toda la mano para llegar al quinto traste en lugar de abrir los dedos.', 'Subir el hombro o apretar el pulgar para alcanzar la distancia.', 'Seguir tocando con dolor: si molesta, detente y empieza por la posición 12, donde los trastes están más juntos.'],
        criterion: 'Recorre las cuatro posiciones con las notas claras y sin tensión. Si la primera posición todavía no sale, practícala al final, cuando la mano ya esté caliente.',
        figure: 'corcheas',
        speed: 1,
        perRow: 15,
        ...withSections(chromaticPositions.map(([title, position]) => ({ title, pattern: chromaticAt(position, [1, 3, 5, 3, 5]) }))),
    },
    'arpeggios-maj7': {
        description: 'El Maj7 es el sonido de la bossa nova y de las baladas elegantes: dulce y luminoso. Con él, tus solos empiezan a dibujar los acordes en vez de solo correr la escala.',
        goal: 'Interiorizar el color de la séptima mayor. El recorrido de los dedos es exactamente el mismo para CMaj7 y FMaj7: solo cambia el traste de partida.',
        steps: ['Al armonizar la escala mayor obtenemos dos acordes Maj7, en el primer y cuarto grado: CMaj7 y FMaj7.', 'La característica de ambos es la séptima mayor en su estructura. Fórmula: 1 – 3 – 5 – 7.', 'Sube desde la quinta cuerda hasta la primera y vuelve. Resolvemos en la tercera mayor y no en la tónica para no dejar un silencio en el compás.', 'Una nota por subdivisión, con el metrónomo. Toca cada arpegio limpio antes de pasar al siguiente.'],
        mistakes: ['Dejar sonar dos notas a la vez al cruzar de cuerda.', 'Mover la mano entera en lugar de estirar el meñique para la séptima.', 'Acelerar en la bajada.'],
        criterion: 'Cuando los dos arpegios suenen parejos a una velocidad cómoda, sube el BPM. La meta es llegar a Intenso.',
        figure: 'corcheas',
        speed: 2,
        perRow: 16,
        picking: 'legato',
        ...withSections([{ title: 'CMaj7 · grado I', pattern: ARPEGGIOS.cmaj7 }, { title: 'FMaj7 · grado IV', pattern: ARPEGGIOS.fmaj7 }]),
    },
    'arpeggios-m7': {
        description: 'El m7 es un menor relajado, sin dramatismo: suena a soul, a funk y a jazz tranquilo. Sobre cada acorde menor de la escala tiene un matiz distinto.',
        goal: 'Reconocer el color menor con séptima menor. Los tres arpegios usan el mismo recorrido de dedos: solo varía el traste.',
        steps: ['Al armonizar la escala mayor obtenemos tres acordes m7, en el segundo, tercer y sexto grado: Dm7, Em7 y Am7.', 'Su característica es la tercera menor y la séptima menor. Fórmula: 1 – b3 – 5 – b7.', 'Volvemos a resolver en la tercera, esta vez la tercera menor, para no dejar un silencio en el compás.', 'Una nota por subdivisión. Cambia de arpegio sin detenerte: es el mismo dibujo en otra posición.'],
        mistakes: ['Confundir el dibujo con el de Maj7 (la tercera y la séptima están un traste más abajo).', 'Perder el pulso al cambiar de posición entre arpegios.'],
        criterion: 'Sube el BPM cuando puedas encadenar los tres sin pausas y con todas las notas iguales.',
        figure: 'corcheas',
        speed: 2,
        perRow: 16,
        picking: 'legato',
        ...withSections([{ title: 'Dm7 · grado II', pattern: ARPEGGIOS.dm7 }, { title: 'Em7 · grado III', pattern: ARPEGGIOS.em7 }, { title: 'Am7 · grado VI', pattern: ARPEGGIOS.am7 }]),
    },
    'arpeggios-dominant': {
        description: 'El dominante es la tensión que pide resolver, el motor del blues. Su arpegio te enseña a marcar ese momento en un solo, en dos formas distintas.',
        goal: 'Escuchar la tensión del dominante: tercera mayor con séptima menor forman el tritono que pide resolver al primer grado.',
        steps: ['Al armonizar la escala mayor obtenemos un único acorde de séptima de dominante, en el quinto grado: G7.', 'Su característica es la tercera mayor junto a la séptima menor. Fórmula: 1 – 3 – 5 – b7.', 'La segunda parte es una variación de G7 para verlo de otra forma; para completar el compás se repiten las últimas notas.', 'Una nota por subdivisión. Escucha la tensión: es la que hace que la música avance.'],
        mistakes: ['Tocar la séptima mayor por costumbre de Maj7.', 'Perder el pulso en los saltos de cuerda de la variación.'],
        criterion: 'Sube el BPM cuando las dos formas suenen igual de limpias.',
        figure: 'corcheas',
        speed: 2,
        perRow: 16,
        picking: 'legato',
        ...withSections([{ title: 'G7 · grado V', pattern: ARPEGGIOS.g7 }, { title: 'G7 · variación', pattern: ARPEGGIOS.g7ii }]),
    },
    'arpeggios-half-diminished': {
        description: 'Oscuro, misterioso e inestable: el semidisminuido es el acorde del suspenso en el jazz. Su arpegio da a tus solos un color sombrío y elegante.',
        goal: 'Dominar el color semidisminuido: tercera menor, quinta disminuida y séptima menor. La inversión amplía tu visión del mástil.',
        steps: ['Al armonizar la escala mayor obtenemos un único acorde m7b5, en el séptimo grado: Bm7b5.', 'Su característica es la tercera menor, la quinta disminuida y la séptima menor. Fórmula: 1 – b3 – b5 – b7.', 'La segunda parte es la primera inversión, Bm7b5/D: empieza desde la tercera.', 'Reto: encuentra tú las inversiones que faltan, desde la quinta o desde la séptima menor.'],
        mistakes: ['Tocar la quinta justa en lugar de la disminuida.', 'Tensar la mano en la posición baja del mástil.'],
        criterion: 'Sube el BPM cuando las dos formas salgan sin dudar en la quinta disminuida.',
        figure: 'corcheas',
        speed: 2,
        perRow: 16,
        picking: 'legato',
        ...withSections([{ title: 'Bm7b5 · grado VII', pattern: ARPEGGIOS.bm7b5 }, { title: 'Bm7b5/D · primera inversión', pattern: ARPEGGIOS.bm7b5d }]),
    },
    'arpeggios-harmonized': {
        description: 'Los siete arpegios de la escala de C, uno tras otro, subiendo sin parar. La escala se convierte en una progresión completa: un reto de resistencia y memoria.',
        goal: 'Encadenar la escala armonizada completa, de la tónica a su octava. Cada arpegio termina en la quinta cuerda y el siguiente empieza en la misma cuerda, uno o dos trastes más arriba: el cambio tiene que sonar continuo.',
        steps: ['El orden es el de la escala: I CMaj7, II Dm7, III Em7, IV FMaj7, V G7, VI Am7, VII Bm7b5 y cierra en la octava con CMaj7.', 'Todos usan el mismo recorrido: suben de la quinta a la primera cuerda, vuelven y resuelven en la tercera.', 'El paso de un arpegio al siguiente es corto y en la misma cuerda: prepara la mano mientras tocas las últimas notas.', 'Bm7b5 va una octava arriba (traste 14) para seguir subiendo sin saltos, y el CMaj7 final, en el traste 15.', 'Una nota por subdivisión, sin pausas entre acordes. Empieza lento: son 128 notas seguidas.'],
        mistakes: ['Detenerse o acentuar el primer tiempo de cada arpegio nuevo.', 'Perder la tercera o la séptima correcta al cambiar de tipo de acorde (mayor, menor, dominante, semidisminuido).', 'Tensar la mano en los trastes altos.'],
        criterion: 'Recorre los ocho arpegios sin cortes antes de subir el BPM. Si un cambio falla, practica solo ese par de arpegios.',
        figure: 'corcheas',
        speed: 2,
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
        description: 'Puro Yngwie: elegante, dramático y rapidísimo, como un violinista de Bach con distorsión. Frases que dibujan los acordes y rematan en un arpegio barrido.',
        goal: 'Que todas las notas suenen parejas y sin acentos raros mientras la mano cambia de cuerda y de posición.',
        steps: [
            'Sigue la tablatura: cada grupo de notas se repite dos veces antes de pasar al siguiente.',
            'Usa púa alternada en todo el lick, menos en el arpegio final: ahí la púa barre las cuerdas (⊓ al subir, V al bajar) y en la primera cuerda se liga con hammer-on y pull-off (h y p).',
            'Mantén la mano relajada en los cambios de posición; deja que el brazo la lleve.',
        ],
        mistakes: ['Acentuar algunas notas más que otras.', 'Llegar tarde a los cambios de cuerda o de posición.', 'Dejar sonar la cuerda anterior.', 'Tensar la mano en los estiramientos.'],
        criterion: 'Si te cuesta, practica cada grupo por separado y luego únelos. Sube la velocidad cuando todo suene parejo.',
        perRow: 12,
        figure: 'sextillos',
        artist: 'yngwie-malmsteen',
        speed: 1,
        // El arpegio final de Bm va en sweep: púa solo al cambiar de cuerda, hammer-on / pull-off en la primera.
        legatoFrom: tabBars('licks-phrasing-yngwie-01', 'sextillos').flat().length - 11, // las 11 últimas: el sweep de Bm
        pattern: tabBars('licks-phrasing-yngwie-01', 'sextillos').flat(),
    },
    'licks-phrasing-yngwie-02': {
        description: 'Una cascada neoclásica: la melodía cae por la primera cuerda y remata con un arpegio disminuido que baja como una escalera sin fin. Oscuro y veloz.',
        goal: 'Desplazar la mano a lo largo de la cuerda sin perder el pulso: cada grupo empieza dos trastes más abajo que el anterior.',
        steps: [
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
        speed: 3,
        pattern: tabBars('licks-phrasing-yngwie-02', 'semicorcheas').flat(),
    },
    'licks-phrasing-becker-01': {
        description: 'Arpegios barridos que suenan como un arpa eléctrica y suben con una fluidez increíble. El estudio de Jason Becker es una gran puerta de entrada al sweep picking.',
        goal: 'Barrer las cuerdas con un solo movimiento de púa en cada dirección y ligar las notas de la primera cuerda sin perder el pulso al cambiar de posición, con todas las notas parejas.',
        steps: [
            'Cada figura empieza en la primera cuerda con un pull-off (p) y barre la segunda y la tercera: la púa cae hacia abajo al bajar a las cuerdas graves y hacia arriba al volver.',
            'Practica cada compás por separado hasta que suene parejo y luego únelos de dos en dos.',
            'En los cambios de posición (compases 5, 6, 13 y 14) deja que el brazo lleve la mano; no estires los dedos.',
            'El último compás baja por el arpegio hasta la sexta cuerda: mantén el barrido igual de limpio en las cuerdas graves.',
        ],
        mistakes: ['Que las notas del barrido suenen juntas como un acorde: levanta cada dedo al pasar a la siguiente cuerda.', 'Atacar con púa las notas ligadas.', 'Acelerar en los barridos y frenar en los pull-offs.'],
        criterion: 'Toca todo el estudio sin pausas y con las notas al mismo volumen. Sube el BPM solo cuando el sweep no suene a acorde.',
        // Algunos compases traen 17 o 18 notas: con 18 por fila cada compás entra entero en una fila.
        perRow: 18,
        figure: 'semicorcheas',
        picking: 'legato',
        artist: 'jason-becker',
        speed: 2,
        ...withSections(tabBars('licks-phrasing-becker-01', 'semicorcheas').map(pattern => ({ title: '', pattern }))),
    },
    'licks-phrasing-gilbert-01': {
        description: 'Paul Gilbert convirtió el salto de cuerdas en su sello: frases amplias, como si tocaran dos guitarras. Este lick baja por el mástil con ese sonido abierto.',
        goal: 'Saltar de la tercera a la primera cuerda sin que suene la segunda y sin perder el pulso, con los saltos tan parejos como las notas en la misma cuerda.',
        steps: [
            'Cada figura sube tres notas en la tercera cuerda, salta a la primera y vuelve: la púa pasa por encima de la segunda cuerda sin tocarla.',
            'Púa solo al cambiar de cuerda; en la misma cuerda las notas van ligadas: hammer-on (h) al subir de traste y pull-off (p) al bajar.',
            'Practica cada figura por separado y luego únelas: en cada una la mano baja a la posición siguiente.',
            'La última figura resuelve en 5/1 con una negra: déjala sonar.',
        ],
        mistakes: ['Que suene la segunda cuerda al saltar: apágala con la palma o con los dedos libres.', 'Atacar con púa las notas ligadas: los hammer-ons y pull-offs deben sonar igual de fuerte.', 'Mover todo el brazo en cada salto en vez de solo la muñeca.', 'Acelerar en la primera cuerda y frenar al volver a la tercera.'],
        criterion: 'Toca las seis figuras sin pausas y sin que suene la segunda cuerda. Sube el BPM cuando los saltos suenen igual que las notas en la misma cuerda.',
        perRow: 18,
        figure: 'semicorcheas',
        picking: 'legato',
        artist: 'paul-gilbert',
        speed: 3,
        ...withSections(tabBars('licks-phrasing-gilbert-01', 'semicorcheas').map(pattern => ({ title: '', pattern }))),
    },
    'licks-phrasing-romeo-01': {
        description: 'Michael Romeo, de Symphony X, une la precisión del metal con lo sinfónico. Tapping y salto de cuerdas para un sonido épico, casi orquestal, en Em.',
        goal: 'Coordinar el tapping con el legato de la mano izquierda mientras saltas entre la tercera y la primera cuerda, con todas las notas al mismo volumen y sin que suene la segunda.',
        steps: [
            'Cada compás repite dos veces la misma figura: baja tres notas en la primera cuerda, salta a la tercera, baja hasta el 9 y vuelve a subir.',
            'Lo que cambia es la nota más aguda de la tercera cuerda: 16 (B) en Em, 17 (C) en los compases 3 y 4, y 14 (A) con la primera cuerda en 14–12–10 en los compases 5 y 6, sobre D.',
            'Fíjate en el final de cada compás: a veces vuelve con 12–14 y a veces con 10–12 para preparar el compás siguiente.',
            'Sin púa: la primera nota de cada grupo (T) va con tapping de la mano derecha; las otras dos se ligan con pull-off o hammer-on de la izquierda.',
            'Al cambiar de cuerda sin tapping, la nota entra con un hammer-on desde la nada: pisa firme para que suene.',
            'Practica primero un compás y luego encadénalos.',
        ],
        mistakes: ['Que suene la segunda cuerda o las cuerdas al aire: apágalas con la palma y los dedos libres de ambas manos.', 'Que el tapping suene mucho más fuerte que las notas ligadas.', 'Tapear sin sacar el dedo hacia un lado (pull-off): la nota siguiente no suena.', 'Perder el pulso en los cambios de compás.'],
        criterion: 'Toca los ocho compases sin pausas y sin que suene la segunda cuerda. Sube el BPM cuando cada salto suene igual que las notas en la misma cuerda.',
        perRow: 12,
        figure: 'sextillos',
        picking: 'tapping',
        artist: 'michael-romeo',
        speed: 1,
        pattern: tabBars('licks-phrasing-romeo-01', 'sextillos').flat(),
    },
    'licks-phrasing-romeo-02': {
        description: 'En «Of Sins and Shadows», Michael Romeo encadena arpegios con tapping que suben de las cuerdas graves a las agudas: rápidos, oscuros y con un aire sinfónico.',
        goal: 'Encadenar arpegios con tapping en varias cuerdas: el tap, los hammer-ons y los pull-offs al mismo volumen, y los cambios de cuerda sin cortes.',
        steps: [
            'Son tres frases. Las dos primeras cruzan de la quinta a la tercera y a la primera cuerda, con un giro en la sexta; la tercera se queda entre la tercera y la primera.',
            'En cada cuerda, la mano izquierda pisa las notas graves y la derecha tapea la aguda (T). Después del tap, pull-off a las notas de la izquierda.',
            'Al llegar a una cuerda nueva sin tap, la primera nota entra con un hammer-on desde la nada: pisa firme para que suene.',
            'El 16–15–16 de la sexta cuerda es solo de la mano izquierda: pull-off y hammer-on, sin tap.',
            'Practica cada frase por separado y luego encadénalas.',
        ],
        mistakes: ['Que el tap suene más fuerte que las notas ligadas.', 'Dejar sonar las cuerdas al aire: apágalas con la palma y los dedos libres.', 'Perder el pulso en los cambios de cuerda.'],
        criterion: 'Toca las tres frases de corrido y con todas las notas parejas. Sube el BPM cuando los cambios de cuerda no se noten.',
        figure: 'tresillos',
        perRow: 12,
        picking: 'tapping',
        artist: 'michael-romeo',
        speed: 5, // la velocidad original
        ...withSections(tabBars('licks-phrasing-romeo-02', 'tresillos').map((pattern, index) => ({ title: `Frase ${index + 1}`, pattern }))),
    },
    'licks-phrasing-howe-01': {
        description: 'Greg Howe es pura fusión: rock con alma de jazz. En «Abrupt Terminal» los arpegios suben y bajan con tapping arriba, brillantes y llenos de energía.',
        goal: 'Tocar los arpegios con púa alternada y meter el tapping sin cortar el pulso, con todas las notas al mismo volumen.',
        steps: [
            'Cada línea es un compás de 3/4: doce semicorcheas, cuatro por pulso.',
            'Púa alternada ⊓ V en todas las notas, también al cambiar de cuerda.',
            'Las notas con T (trastes 21 y 22) van con tapping de la mano derecha; la nota siguiente en la misma cuerda sale con pull-off desde el tap.',
            'En los compases 11 y 12 los taps caen en la segunda cuerda: deja la mano izquierda fija en 12–15 y tapea el 22.',
            'Practica cada compás por separado y luego encadénalos.',
            'La versión original va a 132 BPM: es la meta, no el punto de partida.',
        ],
        mistakes: ['Que el tap suene más fuerte o más débil que las notas con púa.', 'Perder el lugar de la púa después del tap: retoma la alternancia sin reiniciar con ⊓.', 'Que suenen las cuerdas al aire en los saltos a la quinta y sexta cuerda.', 'Acelerar en los compases fáciles y frenar en los saltos de cuerda.'],
        criterion: 'Toca los trece compases sin pausas y con los taps a tiempo. Sube el BPM cuando el pull-off después de cada tap suene tan claro como las notas con púa.',
        perRow: 12,
        figure: 'semicorcheas',
        artist: 'greg-howe',
        transcribedBy: 'Koko Rengifo',
        speed: 4,
        pattern: tabBars('licks-phrasing-howe-01', 'semicorcheas').flat(),
    },
    'licks-phrasing-vinnie-01': {
        description: 'Vinnie Moore, de los grandes del shred de los 80: melódico y veloz. Este lick baja por Am, cambia de posición sin que se note y aterriza con fuerza en la tónica.',
        goal: 'Bajar la escala con púa alternada continua y cambiar de posición sin que se note un corte en el sonido.',
        steps: [
            'Cada cuerda tiene tres notas que bajan (13–12–10 en la primera). Cada dos cuerdas es un sextillo: un pulso.',
            'Después de la cuarta cuerda vuelves a la tercera dos trastes más abajo (10–9–7): ahí la mano baja a la posición siguiente.',
            'Púa alternada continua, empezando con ⊓. La última nota, el 5 de la sexta cuerda, es la resolución: una negra, un pulso entero.',
        ],
        mistakes: ['Cortar el pulso al volver a la tercera cuerda.', 'Acentuar la primera nota de cada cuerda.', 'Reiniciar la púa con ⊓ en cada cuerda en vez de seguir alternando.'],
        criterion: 'Toca el lick completo sin pausas en el cambio de posición. Sube la velocidad cuando los ocho grupos suenen parejos.',
        perRow: 12,
        figure: 'sextillos',
        artist: 'vinnie-moore',
        speed: 2,
        pattern: tabBars('licks-phrasing-vinnie-01', 'sextillos').flat(),
    },
    'arpeggios-modal-chain': {
        description: 'Los siete arpegios modales encadenados: el brillo del jónico, la melancolía del dórico, lo oscuro del frigio, lo mágico del lidio… hasta volver a casa.',
        goal: 'Recorrer los siete modos en un solo pasaje y oír cómo cambia el color en cada grado: la trecena del dórico, la b9 del frigio y la #11 del lidio.',
        steps: ['El orden es el de la escala: I jónico, II dórico, III frigio, IV lidio, V mixolidio, VI eólico, VII locrio y cierra en la octava con CMaj7.', 'Cada arpegio termina en la quinta cuerda y el siguiente empieza en la misma cuerda, uno o dos trastes más arriba.', 'Solo tres arpegios cambian respecto a «Los arpegios de séptima encadenados»: Dm13 (dórico), Em7(b9) (frigio) y FMaj7(#11) (lidio). Jónico, mixolidio, eólico y locrio son los mismos arpegios de séptima, sin alteración.', 'Bm7b5 va una octava arriba (traste 14) para seguir subiendo sin saltos, y el CMaj7 final, en el traste 15.', 'Una nota por subdivisión, sin pausas entre acordes. Empieza lento: son 128 notas seguidas.'],
        mistakes: ['Detenerse o acentuar el primer tiempo de cada arpegio nuevo.', 'Tocar la séptima del arpegio de séptima en lugar de la tensión del modo.', 'Tensar la mano en los trastes altos.'],
        criterion: 'Recorre los ocho arpegios sin cortes antes de subir el BPM. Si un cambio falla, practica solo ese par de arpegios.',
        figure: 'corcheas',
        speed: 2,
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
    ...Object.fromEntries([1, 2, 3, 4, 5].map(position => [`pentatonic-horizontal-0${position}`, pentatonicHorizontalStudy(position)])),
    ...Object.fromEntries([1, 2, 3, 4, 5].map(position => [`pentatonic-horizontal-blues-0${position}`, pentatonicHorizontalStudy(position, true)])),
    ...Object.fromEntries(MODAL_PENTATONICS.map(item => [item.id, modalPentatonicStudy(item)])),
    ...Object.fromEntries(INTERVAL_PENTATONICS.map(item => [item.id, intervalStudy(item)])),
};

/** Cómo se ataca cada nota: púa abajo (⊓), púa arriba (V), hammer-on (h), pull-off (p) o tapping (T). */
export type Stroke = 'down' | 'up' | 'hammer' | 'pull' | 'slide' | 'tap';

/** Ataque de cada nota del patrón según la técnica del estudio. */
export function pickingOf(pattern: PatternNote[], picking: PracticeStudy['picking'] = 'alternate', legatoFrom = Infinity): Stroke[] {
    if (picking === 'tapping') return pattern.map((note, index) => {
        const previous = pattern[index - 1];
        if (note.tap) return 'tap';
        return previous && previous.string === note.string && note.fret < previous.fret ? 'pull' : 'hammer';
    });
    // Con púa alternada, una nota con `tap` va con la mano derecha (T) y la siguiente en la misma cuerda y más abajo sale con pull-off.
    if (picking === 'alternate' && legatoFrom === Infinity) return pattern.map((note, index) => {
        const previous = pattern[index - 1];
        if (note.tap) return 'tap';
        if (previous?.tap && previous.string === note.string && note.fret < previous.fret) return 'pull';
        return note.slide ? 'slide' : index % 2 === 0 ? 'down' : 'up';
    });
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
