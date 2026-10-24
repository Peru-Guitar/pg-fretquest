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
    'licks-phrasing-yngwie-01': {
        description: 'Un lick neoclásico de Yngwie Malmsteen en Si menor: pequeños grupos de notas que recorren varios acordes y terminan con un arpegio en sweep.',
        notation: 'Afinación estándar E A D G B e · Metrónomo en negras · Púa alternada continua',
        goal: 'Que todas las notas suenen parejas y sin acentos raros mientras la mano cambia de cuerda y de posición.',
        steps: [
            'Escucha el ejercicio primero para tener el sonido en la cabeza.',
            'Sigue la tablatura: cada grupo de notas se repite dos veces antes de pasar al siguiente.',
            'Usa púa alternada en todo el lick, menos en el arpegio final, donde la púa barre las cuerdas.',
            'Mantén la mano relajada en los cambios de posición; deja que el brazo la lleve.',
        ],
        mistakes: ['Acentuar algunas notas más que otras.', 'Llegar tarde a los cambios de cuerda o de posición.', 'Dejar sonar la cuerda anterior.', 'Tensar la mano en los estiramientos.'],
        criterion: 'Si te cuesta, practica cada grupo por separado y luego únelos. Sube la velocidad cuando todo suene parejo.',
        perRow: 12,
        figure: 'sextillos',
        artist: 'yngwie-malmsteen',
        bpm: 60,
        pattern: yngwieBars.flat(),
    },
};
