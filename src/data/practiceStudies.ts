import type { PatternNote } from '@/lib/audio/practiceRound';

export type PracticeStudy = {
    description: string;
    notation?: string;
    goal: string;
    steps: string[];
    mistakes: string[];
    criterion: string;
    /** Notas por fila de la tablatura (16 por defecto). */
    perRow?: number;
    /** Notas por clic del metrónomo: 1 = negras (por defecto), 2 = corcheas, 6 = sextillos. */
    notesPerBeat?: number;
    /** Clics del metrónomo por pulso: 1 (por defecto) o 2 para marcar las corcheas. */
    clicksPerBeat?: number;
    variants: { title: string; pattern: PatternNote[] }[];
};
const line = (string: number, fingers: number[]): PatternNote[] => fingers.map(finger => ({ string, fret: finger + 4 }));
const across = (fingers: number[], strings = [6, 5, 4, 3, 2, 1]) => strings.flatMap(string => line(string, fingers));
const variant = (title: string, pattern: PatternNote[]) => ({ title, pattern });

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
        description: 'Alterna pares de dedos en una sola cuerda para controlar especialmente el anular y el meñique, sin compensar con toda la mano.',
        goal: 'Conseguir ataques iguales con los pares 1–2, 2–3 y 3–4, manteniendo los dedos libres cerca de las cuerdas.',
        steps: ['Usa la tercera cuerda. Dedos 1, 2, 3 y 4 = índice, medio, anular y meñique; corresponden a los trastes 5, 6, 7 y 8.', 'Alterna la púa abajo–arriba: una nota por clic. Al bajar de traste, levanta el dedo más agudo justo antes del ataque.', 'Apoya cada dedo cerca del traste, con la presión mínima que dé una nota clara. Los otros dedos descansan; no los fuerces a quedar inmóviles.'],
        mistakes: ['Apretar el pulgar para ayudar al meñique.', 'Levantar mucho los dedos o mover la muñeca en cada nota.'],
        criterion: 'Completa tres rondas de cada par sin zumbidos, cortes ni tensión. Si hay molestias, detente; si pierdes claridad, baja la velocidad.',
        variants: [variant('Índice y medio · 1–2', line(3, [1,2,1,2,1,2,1,2,2,1,2,1,2,1,2,1])), variant('Medio y anular · 2–3', line(3, [2,3,2,3,2,3,2,3,3,2,3,2,3,2,3,2])), variant('Anular y meñique · 3–4', line(3, [3,4,3,4,3,4,3,4,4,3,4,3,4,3,4,3]))],
    },
    'fingering-02': {
        description: 'Recorre las seis cuerdas con un cromático de cuatro notas por cuerda, primero ascendiendo y después descendiendo.',
        goal: 'Conservar el mismo pulso y volumen durante todo el recorrido, incluida la vuelta.',
        steps: ['Mantén una posición fija: índice en 5, medio en 6, anular en 7 y meñique en 8.', 'Toca 5–6–7–8 desde la sexta hasta la primera cuerda. En el descenso toca 8–7–6–5 desde la primera hasta la sexta.', 'Usa púa alternada continua y una nota por clic. El 8 de la primera cuerda se repite al iniciar la vuelta: son dos ataques distintos.', 'Silencia las cuerdas que abandonas con el contacto suave de ambas manos.'],
        mistakes: ['Acelerar al llegar a la primera cuerda.', 'Arrastrar los dedos y dejar sonar dos cuerdas a la vez.'],
        criterion: 'Haz tres recorridos completos sin detenerte en los cambios. Aumenta la velocidad solo si el regreso es tan limpio como la ida.',
        variants: [variant('Ida y vuelta', [...across([1,2,3,4]), ...across([4,3,2,1], [1,2,3,4,5,6])]), variant('Solo ascenso', across([1,2,3,4])), variant('Solo descenso', across([4,3,2,1], [1,2,3,4,5,6]))],
    },
    'fingering-03': {
        description: 'Cambia el orden de los cuatro dedos para salir del automatismo cromático sin desplazar la mano.',
        goal: 'Ejecutar tres permutaciones con la digitación indicada, sin sustituir el anular o el meñique por dedos más cómodos.',
        steps: ['Dedos 1–2–3–4 en trastes 5–6–7–8. Lee la variante antes de empezar: los números de su nombre son dedos.', 'Recorre de sexta a primera cuerda con el mismo orden en cada una. Ataca todas las notas con púa alternada, una por clic.', 'Prepara el siguiente dedo cerca de su traste. Al bajar a una nota más grave, retira los dedos que taparían esa nota.'],
        mistakes: ['Convertir el patrón involuntariamente en 1–2–3–4.', 'Dejar un dedo apoyado por encima del traste que debe sonar.'],
        criterion: 'Completa tres rondas por variante sin corregir la digitación a mitad del patrón. Practica cada variante a su propia velocidad cómoda.',
        variants: [variant('Dedos 1–3–2–4', across([1,3,2,4])), variant('Dedos 1–4–2–3', across([1,4,2,3])), variant('Dedos 4–2–3–1', across([4,2,3,1]))],
    },
    'fingering-04': {
        description: 'Compara dos ataques por nota con un ataque por nota para ajustar el instante en que coinciden la púa y el dedo.',
        goal: 'Cambiar de traste sin escuchar un ataque apagado antes de la nota ni un ligado involuntario antes de la púa.',
        steps: ['Trabaja en la segunda cuerda con los dedos 1–2–3–4 sobre los trastes 5–6–7–8.', 'En la primera variante toca dos veces cada traste. Conserva el dedo durante ambos ataques y cambia al empezar el siguiente par.', 'Pasa a una nota por traste sin aumentar la velocidad del clic. En la variante mixta, conserva la misma duración para cada ataque.', 'Alterna abajo–arriba durante toda la secuencia. Cada cifra de la tablatura representa un ataque de púa.'],
        mistakes: ['Cambiar el dedo antes del segundo ataque de una pareja.', 'Hacer hammer-ons o pull-offs en lugar de atacar cada nota.'],
        criterion: 'Escucha tres rondas limpias por variante. Si aparecen clics apagados al cambiar, vuelve a los ataques dobles y reduce el tempo.',
        variants: [variant('Dos ataques por nota', line(2, [1,1,2,2,3,3,4,4,4,4,3,3,2,2,1,1])), variant('Un ataque por nota', line(2, [1,2,3,4,4,3,2,1,1,2,3,4,4,3,2,1])), variant('Dobles y simples', line(2, [1,1,2,2,3,3,4,4,1,2,3,4,4,3,2,1]))],
    },
    'fingering-05': {
        description: 'Cruza dos cuerdas vecinas con dos notas por cuerda, manteniendo la sincronización y apagando la cuerda anterior.',
        goal: 'Hacer que la primera nota de cada nueva cuerda sea tan clara y puntual como las demás.',
        steps: ['Dedos 1 y 3 en trastes 5 y 7; dedos 2 y 4 en 6 y 8. Mantén la mano en quinta posición.', 'Repite cada bloque de cuatro notas entre la pareja de cuerdas indicada. La tablatura se lee de izquierda a derecha.', 'Continúa abajo–arriba sin reiniciar la púa al cambiar de cuerda. Toca una nota por clic.', 'Apaga la cuerda que dejas sin cortar prematuramente su última nota. Evita mantener el dedo como una cejilla.'],
        mistakes: ['Hacer un pequeño barrido al cambiar de cuerda.', 'Dejar sonar la cuerda anterior o acentuar cada cruce por tensión.'],
        criterion: 'Completa tres rondas por pareja sin cuerdas superpuestas ni pausas. Revisa por separado los cruces hacia agudos y hacia graves.',
        variants: [variant('Sexta y quinta · 1–3', Array.from({length: 4}, () => [...line(6,[1,3]), ...line(5,[1,3])]).flat()), variant('Cuarta y tercera · 2–4', Array.from({length: 4}, () => [...line(4,[2,4]), ...line(3,[2,4])]).flat()), variant('Primera y segunda · regreso', Array.from({length: 4}, () => [...line(1,[4,2]), ...line(2,[4,2])]).flat())],
    },
    'fingering-06': {
        description: 'Consolida velocidad mediante bucles cortos y precisos; aumenta el tempo solo después de comprobar la limpieza de ambos sentidos.',
        goal: 'Mantener regularidad, volumen y relajación al subir un nivel de tempo, sin esconder fallos con distorsión.',
        steps: ['Usa los trastes 5–8 con un dedo por traste. Empieza a una velocidad que permita controlar cada ataque.', 'Toca cada bucle con púa alternada continua y una nota por clic. La dificultad crece al pasar de una cuerda a dos y luego a una secuencia con saltos de dedo.', 'Después de tres rondas limpias, prueba el siguiente tempo disponible. Si fallas en dos intentos, vuelve al anterior.', 'Descansa entre bloques. El límite de tempo es una opción de práctica, no una obligación ni una medida de tu nivel.'],
        mistakes: ['Subir el tempo aunque el último grupo termine atropellado.', 'Endurecer el antebrazo o aumentar el recorrido de la púa para correr más.'],
        criterion: 'Valora como limpia una ronda solo si no hubo notas omitidas, ruidos extra ni pérdida de pulso. Mantén esa calidad durante tres rondas antes de subir.',
        variants: [variant('Bucle en una cuerda', line(1, [1,2,3,4,4,3,2,1,1,2,3,4,4,3,2,1])), variant('Bucle en dos cuerdas', [...line(2,[1,2,3,4]), ...line(1,[1,2,3,4]), ...line(1,[4,3,2,1]), ...line(2,[4,3,2,1])]), variant('Precisión · 1–3–2–4', [...across([1,3,2,4],[3,2,1]), ...across([4,2,3,1],[1,2,3])])],
    },
    'licks-phrasing-yngwie-01': {
        description: 'Lick de Yngwie Malmsteen en Si menor. Una célula de tres notas por cuerda recorre Bm–Em–A–D–G–C–F#, alternando segunda y primera cuerda, y cierra con un arpegio de Bm en sweep.',
        notation: 'Afinación estándar E A D G B e · Sextillos: 6 notas por pulso · Metrónomo en corcheas · Púa alternada continua',
        goal: 'Tocar los sextillos parejos y sin acentos raros mientras la mano cambia de cuerda y de posición cada dos grupos, y que se escuche la armonía: cada célula dibuja su acorde (Bm, Em, A, D, G, C, F#).',
        steps: [
            'Cada acorde es una célula de tres trastes tocada en el orden aguda–grave–media–aguda–media–grave, dos veces seguidas. Ejemplo en Bm (segunda cuerda): 15–12–14–15–14–12.',
            'Orden de cuerdas: Bm en segunda, Em en primera, A en segunda, D en primera, G en segunda, C en primera y F# en segunda. Cada par de acordes baja dos trastes (15 → 14 → 12 → 11).',
            'Digitación: índice en el traste grave, meñique en el agudo y anular en el medio (medio cuando la célula abarca solo tres trastes, como en 12–14–15).',
            'Púa alternada continua, empezando hacia abajo. Como cada célula tiene seis notas, cada grupo empieza otra vez con púa abajo.',
            'Después de F#: 12–11–12 en segunda cuerda, que resuelve en Si. Conecta con el arpegio bajando 11/3 – 12/4.',
            'Cierre: arpegio de Bm en sweep desde el traste 14 de la quinta cuerda. Sube 14/5 – 12/4 – 11/3 – 12/2 – 10/1 – 14/1 y vuelve por el mismo camino hasta 14/5. La barra separa traste/cuerda.',
            'En el arpegio la púa barre: hacia abajo al subir de quinta a primera cuerda y hacia arriba al volver. Las marcas ⊓ V de la tablatura no aplican en ese tramo. Apaga cada cuerda al dejarla para que el arpegio no suene como un acorde.',
            'Ritmo en sextillos: seis notas por pulso. El metrónomo marca las corcheas (un clic cada tres notas, acentuado en el pulso) para que no te pierdas.',
        ],
        mistakes: ['Acentuar cada grupo de tres notas en lugar de mantener todas iguales.', 'Llegar tarde al cambio de cuerda entre Bm y Em, o de posición entre Em y A.', 'Dejar sonar la cuerda anterior al pasar de segunda a primera.', 'Apretar la mano en las células de cuatro trastes (14–10–12) en lugar de abrir el meñique.'],
        criterion: 'Si te cuesta, aprende primero cada acorde por separado y luego únelos. Sube la velocidad solo si los cambios de cuerda suenan igual de parejos que las notas dentro de la célula.',
        perRow: 12,
        notesPerBeat: 6,
        clicksPerBeat: 2,
        variants: [variant('Lick completo', yngwieBars.flat())],
    },
};
