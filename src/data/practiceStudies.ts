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
// Todos en corcheas, 16 notas (dos compases de 4/4), sobre la escala mayor de Do.
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
};
const ARPEGGIO_TEXT = 'Afinación estándar E A D G B e · Escala mayor de Do · Corcheas: dos compases de 4/4 por acorde · Púa solo al cambiar de cuerda (⊓ al subir, V al bajar) · En la misma cuerda: h hammer-on, p pull-off';

const withSections = (sections: { title: string; pattern: PatternNote[] }[]) => ({ sections, pattern: sections.flatMap(section => section.pattern) });

// Lick 1 de Yngwie Malmsteen: cada acorde es una célula de tres notas en una cuerda (aguda, grave, media, aguda, media, grave)
// tocada dos veces en sextillos. Alterna segunda y primera cuerda por el ciclo de cuartas de Si menor armónica.
const sextuplet = (string: number, [high, low, middle]: number[]): PatternNote[] =>
    [high, low, middle, high, middle, low].map(fret => ({ string, fret }));
const chord = (string: number, frets: number[]) => [...sextuplet(string, frets), ...sextuplet(string, frets)];
// Arpegio de Bm en sweep desde 14/5: sube hasta 14/1 y vuelve a 14/5.
const bmSweepUp: PatternNote[] = [{ string: 5, fret: 14 }, { string: 4, fret: 12 }, { string: 3, fret: 11 }, { string: 2, fret: 12 }, { string: 1, fret: 10 }, { string: 1, fret: 14 }];
const bmSweep = [...bmSweepUp, ...bmSweepUp.slice(0, -1).reverse()];
const yngwieBars: PatternNote[][] = [
    [...chord(2, [15, 12, 14]), ...chord(1, [15, 12, 14])],
    [...chord(2, [14, 10, 12]), ...chord(1, [14, 10, 12])],
    [...chord(2, [12, 8, 10]), ...chord(1, [12, 8, 10])],
    [...chord(2, [11, 7, 9]), { string: 2, fret: 12 }, { string: 2, fret: 11 }, { string: 2, fret: 12 }, { string: 3, fret: 11 }, { string: 4, fret: 12 }, ...bmSweep],
];

export const practiceStudies: Record<string, PracticeStudy> = {
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
        description: 'Los dos arpegios Maj7 de la escala mayor de Do: CMaj7 (grado I) y FMaj7 (grado IV). Fórmula 1 – 3 – 5 – 7.',
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
        description: 'Los tres arpegios m7 de la escala mayor de Do: Dm7 (II), Em7 (III) y Am7 (VI). Fórmula 1 – b3 – 5 – b7.',
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
        description: 'El arpegio de séptima de dominante de la escala mayor de Do: G7 (grado V), en dos formas. Fórmula 1 – 3 – 5 – b7.',
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
        description: 'El arpegio semidisminuido de la escala mayor de Do: Bm7b5 (grado VII) y su primera inversión. Fórmula 1 – b3 – b5 – b7.',
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
        description: 'Los siete arpegios de séptima de la escala mayor de Do, de corrido y sin pausas, hasta la octava: CMaj7, Dm7, Em7, FMaj7, G7, Am7, Bm7b5 y de nuevo CMaj7, subiendo por el mástil.',
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
        description: 'Un lick neoclásico de Yngwie Malmsteen en Si menor: pequeños grupos de notas que recorren varios acordes y terminan con un arpegio en sweep.',
        notation: 'Afinación estándar E A D G B e · Metrónomo en negras · Púa alternada continua',
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
};

/** Cómo se ataca cada nota: púa abajo (⊓), púa arriba (V), hammer-on (h) o pull-off (p). */
export type Stroke = 'down' | 'up' | 'hammer' | 'pull';

/** Ataque de cada nota del patrón según la técnica del estudio. */
export function pickingOf(pattern: PatternNote[], picking: PracticeStudy['picking'] = 'alternate', legatoFrom = Infinity): Stroke[] {
    if (picking === 'alternate' && legatoFrom === Infinity) return pattern.map((_, index) => index % 2 === 0 ? 'down' : 'up');
    // Arpegios: la púa solo ataca al cambiar de cuerda, siguiendo el movimiento (⊓ hacia la aguda, V hacia la grave);
    // en la misma cuerda se liga: hammer-on si el traste sube, pull-off si baja. Cuerda 1 = la más aguda.
    return pattern.map((note, index) => {
        if (picking === 'alternate' && index < legatoFrom) return index % 2 === 0 ? 'down' : 'up';
        const previous = pattern[index - 1];
        // Primera nota del patrón o del tramo de arpegio: empieza el barrido hacia abajo.
        if (!previous || index === legatoFrom) return 'down';
        if (note.string < previous.string) return 'down';
        if (note.string > previous.string) return 'up';
        return note.fret > previous.fret ? 'hammer' : 'pull';
    });
}
