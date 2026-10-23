/**
 * Catálogo de técnicas incluido en la app: Técnica → Lección → Ejercicio.
 * Las tablaturas usan seis líneas (e B G D A E) en texto monoespaciado.
 */

import type { Picking } from "./tab";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface Exercise {
  id: string;
  title: string;
  instructions: string;
  tab: string;
  /** Tempo de arranque y tempo objetivo (negras por minuto). */
  bpmStart: number;
  bpmTarget: number;
  minutes: number;
  /** Notas por pulso al reproducir: 4 = semicorcheas (por defecto), 3 = tresillos. */
  notesPerBeat?: number;
  /** Dirección de púa que se dibuja sobre cada golpe. */
  picking?: Picking;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  exercises: Exercise[];
}

export interface Technique {
  id: string;
  name: string;
  description: string;
  lessons: Lesson[];
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: "Básico",
  2: "Fácil",
  3: "Intermedio",
  4: "Avanzado",
  5: "Experto",
};

export const TECHNIQUES: Technique[] = [
  {
    id: "alternate-picking",
    name: "Alternate picking",
    description: "Púa estricta abajo-arriba. La base de la velocidad y la precisión rítmica.",
    lessons: [
      {
        id: "ap-una-cuerda",
        title: "Picking en una cuerda",
        description: "Sincroniza la púa con el metrónomo sin cambiar de cuerda.",
        difficulty: 1,
        exercises: [
          {
            id: "ap-tremolo",
            title: "Trémolo en Mi agudo",
            instructions: "Semicorcheas en el traste 5 de la primera cuerda. Mantén la púa pequeña y relajada; mueve la muñeca, no el brazo.",
            tab: `e|-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-|
B|---------------------------------|
G|---------------------------------|
D|---------------------------------|
A|---------------------------------|
E|---------------------------------|`,
            bpmStart: 60,
            bpmTarget: 120,
            minutes: 5,
            picking: "alternate",
          },
          {
            id: "ap-cromatico",
            title: "Cromático 1-2-3-4",
            instructions: "Un dedo por traste, subiendo cuerda a cuerda. Empieza siempre con púa hacia abajo y deja los dedos cerca del diapasón.",
            tab: `e|-------------------------1-2-3-4-|
B|---------------------1-2-3-4-----|
G|-----------------1-2-3-4---------|
D|-------------1-2-3-4-------------|
A|---------1-2-3-4-----------------|
E|-1-2-3-4-------------------------|`,
            bpmStart: 60,
            bpmTarget: 110,
            minutes: 8,
            picking: "alternate",
          },
        ],
      },
      {
        id: "ap-cambio-cuerda",
        title: "Cambio de cuerda",
        description: "Outside e inside picking: el cruce de cuerda es donde se pierde la limpieza.",
        difficulty: 2,
        exercises: [
          {
            id: "ap-outside",
            title: "Outside picking en Si y Mi",
            instructions: "Seis notas repetidas. La púa cruza por fuera de las cuerdas al cambiar; exagera el movimiento al principio.",
            tab: `e|-------5-7-8-------5-7-8-|
B|-5-7-8-------5-7-8-------|
G|-------------------------|
D|-------------------------|
A|-------------------------|
E|-------------------------|`,
            bpmStart: 70,
            bpmTarget: 130,
            minutes: 6,
            picking: "alternate",
          },
          {
            id: "ap-inside",
            title: "Inside picking descendente",
            instructions: "Mismas notas en sentido inverso: la púa queda atrapada entre las cuerdas. Es el cruce más difícil, ve lento.",
            tab: `e|-8-7-5-------8-7-5-------|
B|-------8-7-5-------8-7-5-|
G|-------------------------|
D|-------------------------|
A|-------------------------|
E|-------------------------|`,
            bpmStart: 60,
            bpmTarget: 120,
            minutes: 6,
            picking: "alternate",
          },
        ],
      },
      {
        id: "ap-3nps",
        title: "Escalas a tres notas por cuerda",
        description: "Escalas completas con picking alterno estricto, el estándar del shred.",
        difficulty: 4,
        exercises: [
          {
            id: "ap-3nps-dos-cuerdas",
            title: "La menor en dos cuerdas",
            instructions: "Seis notas en bucle entre Re y Sol. Acentúa la primera nota de cada grupo para mantener el pulso.",
            tab: `e|-------------------------------|
B|-------------------------------|
G|-------7-9-10-------7-9-10-----|
D|-7-9-10-------7-9-10-----------|
A|-------------------------------|
E|-------------------------------|`,
            bpmStart: 70,
            bpmTarget: 140,
            minutes: 8,
            picking: "alternate",
          },
          {
            id: "ap-3nps-completa",
            title: "La menor completa, ida y vuelta",
            instructions: "Seis cuerdas subiendo y bajando sin pausa. Si una cuerda suena sucia, aísla ese cambio y repítelo.",
            tab: `e|------------------------------------------------8-10-12-|
B|---------------------------------------8-10-12----------|
G|-----------------------------7-9-10---------------------|
D|-------------------7-9-10-------------------------------|
A|---------7-8-10-----------------------------------------|
E|-5-7-8--------------------------------------------------|`,
            bpmStart: 60,
            bpmTarget: 130,
            minutes: 10,
            picking: "alternate",
          },
        ],
      },
    ],
  },
  {
    id: "economy-picking",
    name: "Economy picking",
    description: "Alterna dentro de la cuerda y barre al cambiar en la misma dirección. Fluido y eficiente.",
    lessons: [
      {
        id: "ep-fundamentos",
        title: "Fundamentos del barrido corto",
        description: "Aprende a encadenar dos púas en la misma dirección al cambiar de cuerda.",
        difficulty: 2,
        exercises: [
          {
            id: "ep-dos-notas",
            title: "Dos notas por cuerda, ascendente",
            instructions: "Abajo-arriba en cada cuerda… salvo al cambiar: ahí la púa sigue hacia abajo. Patrón: ↓↑ ↓↑ ↓↑.",
            tab: `e|-------------5-8-|
B|---------5-8-----|
G|-----5-7---------|
D|-5-7-------------|
A|-----------------|
E|-----------------|`,
            bpmStart: 60,
            bpmTarget: 110,
            minutes: 6,
          },
          {
            id: "ep-tres-notas",
            title: "Tres notas por cuerda con barrido",
            instructions: "↓↑↓ en la primera cuerda y la siguiente arranca otra vez con ↓: la púa \"cae\" a la cuerda nueva.",
            tab: `e|-------------------|
B|-------------------|
G|-------------------|
D|-----------7-9-10--|
A|---7-8-10----------|
E|-------------------|`,
            bpmStart: 60,
            bpmTarget: 120,
            minutes: 6,
          },
        ],
      },
      {
        id: "ep-patrones",
        title: "Patrones de cinco notas",
        description: "Grupos impares que obligan a combinar alternado y barrido de forma natural.",
        difficulty: 3,
        exercises: [
          {
            id: "ep-cinco-notas",
            title: "Quintillos en Sol y Si",
            instructions: "Tres notas en Sol, dos en Si. Cuenta en grupos de cinco; la púa vuelve a empezar hacia abajo en cada grupo.",
            tab: `e|-----------------------|
B|-------5-7-------5-7---|
G|-4-5-7-------4-5-7-----|
D|-----------------------|
A|-----------------------|
E|-----------------------|`,
            bpmStart: 60,
            bpmTarget: 110,
            minutes: 8,
          },
          {
            id: "ep-mayor",
            title: "Escala mayor en economía",
            instructions: "Sol mayor subiendo con barridos en cada cambio y bajando con barridos hacia arriba.",
            tab: `e|-------------------------------3-5-7-|
B|-----------------------3-5-7---------|
G|----------------2-4-5----------------|
D|---------2-4-5-----------------------|
A|---2-3-5-----------------------------|
E|-3-----------------------------------|`,
            bpmStart: 60,
            bpmTarget: 120,
            minutes: 8,
          },
        ],
      },
      {
        id: "ep-secuencias",
        title: "Secuencias y arpegios",
        description: "Llevar el economy a frases musicales.",
        difficulty: 4,
        exercises: [
          {
            id: "ep-grupos-tres",
            title: "Secuencia en grupos de tres",
            instructions: "Escala de La menor en grupos de tres notas que se solapan. Busca que todo suene a la misma intensidad.",
            tab: `e|-----------------------------|
B|-----------------------------|
G|-----------------------7-----|
D|-7-9-10-9-10-7-10-7-9---9-10-|
A|-----------------------------|
E|-----------------------------|`,
            bpmStart: 60,
            bpmTarget: 120,
            minutes: 8,
          },
          {
            id: "ep-arpegio",
            title: "Arpegio de Do mayor con economía",
            instructions: "Una o dos notas por cuerda: barre donde hay una nota y alterna donde hay dos.",
            tab: `e|-------------8-12-8------------|
B|----------8-----------8--------|
G|-------9-----------------9-----|
D|---10--------------------------|
A|-------------------------------|
E|-------------------------------|`,
            bpmStart: 60,
            bpmTarget: 110,
            minutes: 8,
          },
        ],
      },
    ],
  },
  {
    id: "sweep-picking",
    name: "Sweep picking",
    description: "Un solo movimiento de púa atraviesa varias cuerdas. Arpegios rápidos y limpios.",
    lessons: [
      {
        id: "sp-dos-cuerdas",
        title: "Barrido en dos y tres cuerdas",
        description: "El secreto es apagar cada nota al pasar a la siguiente.",
        difficulty: 2,
        exercises: [
          {
            id: "sp-triada-dos",
            title: "Barrido corto en Si y Mi",
            instructions: "Un movimiento hacia abajo cruza dos cuerdas, pull-off y vuelta hacia arriba. Levanta el dedo de cada nota tras tocarla.",
            tab: `e|-----12p8-------12p8------|
B|---10--------10--------10-|
G|--------------------------|
D|--------------------------|
A|--------------------------|
E|--------------------------|`,
            bpmStart: 50,
            bpmTarget: 100,
            minutes: 6,
          },
          {
            id: "sp-triada-tres",
            title: "Triada menor en tres cuerdas",
            instructions: "La menor: un barrido ↓ por Sol-Si-Mi, pull-off arriba y barrido ↑ de regreso.",
            tab: `e|--------12p8-------|
B|-----10-------10---|
G|--9-------------9--|
D|-------------------|
A|-------------------|
E|-------------------|`,
            bpmStart: 50,
            bpmTarget: 100,
            minutes: 8,
          },
        ],
      },
      {
        id: "sp-progresion",
        title: "Arpegios en progresión",
        description: "Cambia de forma sin perder el ritmo.",
        difficulty: 3,
        exercises: [
          {
            id: "sp-am-g",
            title: "La menor → Sol mayor",
            instructions: "Dos compases por acorde. Prepara la siguiente forma mientras termina el barrido de regreso.",
            tab: `e|--------12p8---------------10p7----------|
B|-----10-------10-------------8-----8-----|
G|--9-------------9-------7-----------7----|
D|-----------------------------------------|
A|-----------------------------------------|
E|-----------------------------------------|`,
            bpmStart: 50,
            bpmTarget: 100,
            minutes: 8,
          },
          {
            id: "sp-am-g-f-e",
            title: "Progresión Am – G – F – E",
            instructions: "Cuatro triadas en tres cuerdas bajando por el mástil. Un compás por acorde, sin detenerte entre cambios.",
            tab: `e|---12p8----10p7----8p5-----7p4-----|
B|-10------8-----8-6-----6--5------5-|
G|9------7-----7-5-----5---4---------|
D|-----------------------------------|
A|-----------------------------------|
E|-----------------------------------|`,
            bpmStart: 50,
            bpmTarget: 100,
            minutes: 10,
          },
        ],
      },
      {
        id: "sp-cinco-cuerdas",
        title: "Arpegios de cinco cuerdas",
        description: "Formas grandes estilo neoclásico. Precisión de ambas manos.",
        difficulty: 5,
        exercises: [
          {
            id: "sp-am-cinco",
            title: "La menor en cinco cuerdas",
            instructions: "Desde la quinta cuerda hasta la primera y de regreso. Notas idénticas en volumen; nada debe sonar a acorde.",
            tab: `e|----------------12p8-------------|
B|-------------10-------10---------|
G|----------9--------------9-------|
D|-------10-------------------10---|
A|-12h15-------------------------15|
E|---------------------------------|`,
            bpmStart: 40,
            bpmTarget: 90,
            minutes: 10,
          },
          {
            id: "sp-am-tap",
            title: "Cinco cuerdas con tap arriba",
            instructions: "Mismo arpegio, pero en la cima añade un tap en el traste 17 con la mano derecha antes de volver.",
            tab: `e|----------------12-t17p12p8------------|
B|-------------10---------------10-------|
G|----------9----------------------9-----|
D|-------10---------------------------10-|
A|-12h15---------------------------------|
E|---------------------------------------|`,
            bpmStart: 40,
            bpmTarget: 90,
            minutes: 10,
          },
        ],
      },
    ],
  },
  {
    id: "tapping",
    name: "Tapping",
    description: "La mano derecha también pisa el diapasón. Intervalos amplios y frases fluidas.",
    lessons: [
      {
        id: "tp-una-cuerda",
        title: "Tap en una cuerda",
        description: "Tap, pull-off y hammer-on: el ciclo básico.",
        difficulty: 2,
        exercises: [
          {
            id: "tp-ciclo",
            title: "Ciclo 12-5-8",
            instructions: "Tap en el 12, pull-off al 5, hammer-on al 8. Apaga las cuerdas graves con la palma o un dedo libre.",
            tab: `e|-t12p5h8-t12p5h8-t12p5h8-t12p5h8-|
B|---------------------------------|
G|---------------------------------|
D|---------------------------------|
A|---------------------------------|
E|---------------------------------|`,
            bpmStart: 50,
            bpmTarget: 110,
            minutes: 6,
          },
          {
            id: "tp-tap-movil",
            title: "Tap que se mueve",
            instructions: "Mantén la mano izquierda fija en 5-8 y mueve el tap: 12, 13, 15, 13. Escucha cómo cambia la armonía.",
            tab: `e|-t12p5h8-t13p5h8-t15p5h8-t13p5h8-|
B|---------------------------------|
G|---------------------------------|
D|---------------------------------|
A|---------------------------------|
E|---------------------------------|`,
            bpmStart: 50,
            bpmTarget: 100,
            minutes: 6,
          },
        ],
      },
      {
        id: "tp-tresillos",
        title: "Tresillos de tapping",
        description: "El clásico de los 80: tresillos continuos sobre acordes.",
        difficulty: 3,
        exercises: [
          {
            id: "tp-tresillo-fijo",
            title: "Tresillo continuo",
            instructions: "Tap 12, pull-off 5, hammer 8, en tresillos sin pausa. El tap debe sonar tan fuerte como las otras notas.",
            tab: `e|---------------------------------|
B|-t12p5h8-t12p5h8-t12p5h8-t12p5h8-|
G|---------------------------------|
D|---------------------------------|
A|---------------------------------|
E|---------------------------------|`,
            bpmStart: 50,
            bpmTarget: 100,
            minutes: 8,
            notesPerBeat: 3,
          },
          {
            id: "tp-cambio-acordes",
            title: "Tresillos sobre Am – F – G",
            instructions: "Mismo patrón cambiando la posición de la mano izquierda cada compás. Mantén el tap en el 12.",
            tab: `e|-----------------------------------|
B|-t12p5h8-t12p5h8-t12p6h10-t12p8h10-|
G|-----------------------------------|
D|-----------------------------------|
A|-----------------------------------|
E|-----------------------------------|`,
            bpmStart: 50,
            bpmTarget: 100,
            minutes: 8,
            notesPerBeat: 3,
          },
        ],
      },
      {
        id: "tp-varias-cuerdas",
        title: "Tapping en varias cuerdas",
        description: "Saltos de cuerda y arpegios a dos manos.",
        difficulty: 4,
        exercises: [
          {
            id: "tp-salto",
            title: "Salto de cuerda Sol – Mi",
            instructions: "Mismo ciclo en la tercera y la primera cuerda alternando. Apagar las cuerdas intermedias es la clave.",
            tab: `e|---------t15p7h10---------t15p7h10-|
B|-----------------------------------|
G|-t14p7h9---------t14p7h9-----------|
D|-----------------------------------|
A|-----------------------------------|
E|-----------------------------------|`,
            bpmStart: 50,
            bpmTarget: 100,
            minutes: 8,
          },
          {
            id: "tp-arpegio",
            title: "Arpegio de La menor a dos manos",
            instructions: "Hammer-ons de la izquierda en Re, Sol y Si, y el tap completa la nota alta en cada cuerda.",
            tab: `e|-------------------------------|
B|--------------------t17p10h13--|
G|-----------t14p9h12------------|
D|--t19p7h10---------------------|
A|-------------------------------|
E|-------------------------------|`,
            bpmStart: 45,
            bpmTarget: 90,
            minutes: 10,
          },
        ],
      },
    ],
  },
  {
    id: "legato",
    name: "Legato",
    description: "Notas ligadas con hammer-ons y pull-offs. Fuerza y resistencia de la mano izquierda.",
    lessons: [
      {
        id: "lg-fundamentos",
        title: "Hammer-ons y pull-offs",
        description: "Volumen parejo entre notas pulsadas y ligadas.",
        difficulty: 1,
        exercises: [
          {
            id: "lg-trino",
            title: "Trino 5-7",
            instructions: "Una púa y luego trino continuo entre los trastes 5 y 7. Sin tensión en el pulgar.",
            tab: `e|-------------------------------|
B|-------------------------------|
G|-5h7p5h7p5h7p5h7p5h7p5h7p5h7p5-|
D|-------------------------------|
A|-------------------------------|
E|-------------------------------|`,
            bpmStart: 60,
            bpmTarget: 120,
            minutes: 5,
          },
          {
            id: "lg-cuatro-dedos",
            title: "Hammer-on con cuatro dedos",
            instructions: "Pulsa solo la primera nota de cada cuerda; las otras tres son hammer-ons. Usa los cuatro dedos.",
            tab: `e|-----------------------5h6h7h8-|
B|-----------------5h6h7h8-------|
G|-----------5h6h7h8-------------|
D|-----5h6h7h8-------------------|
A|-------------------------------|
E|-------------------------------|`,
            bpmStart: 60,
            bpmTarget: 110,
            minutes: 6,
          },
        ],
      },
      {
        id: "lg-escalas",
        title: "Escalas en legato",
        description: "Una púa por cuerda, el resto lo hace la mano izquierda.",
        difficulty: 3,
        exercises: [
          {
            id: "lg-ascendente",
            title: "Escala ascendente, una púa por cuerda",
            instructions: "La menor 3nps: púa en la primera nota de cada cuerda, hammer-ons en las otras dos.",
            tab: `e|----------------------------8h10h12-|
B|---------------------8h10h12--------|
G|---------------7h9h10---------------|
D|--------7h9h10----------------------|
A|-7h8h10-----------------------------|
E|------------------------------------|`,
            bpmStart: 60,
            bpmTarget: 120,
            minutes: 8,
          },
          {
            id: "lg-descendente",
            title: "Escala descendente con pull-offs",
            instructions: "Al bajar, los pull-offs tiran ligeramente de la cuerda hacia abajo para que suene la nota siguiente.",
            tab: `e|-12p10p8--------------------------------|
B|---------12p10p8------------------------|
G|-----------------10p9p7-----------------|
D|-------------------------10p9p7---------|
A|---------------------------------10p8p7-|
E|----------------------------------------|`,
            bpmStart: 60,
            bpmTarget: 120,
            minutes: 8,
          },
        ],
      },
      {
        id: "lg-secuencias",
        title: "Secuencias y resistencia",
        description: "Frases largas sin púa para construir resistencia.",
        difficulty: 4,
        exercises: [
          {
            id: "lg-cuatros",
            title: "Secuencia en grupos de cuatro",
            instructions: "Cuatro notas ligadas que suben de una en una por la escala. Mantén el pulso con acento en cada grupo.",
            tab: `e|-------------------------------|
B|-------------------------------|
G|-------------------------------|
D|-7h9h10-9h10-7-10-7h9-7h9h10---|
A|-------------------------------|
E|-------------------------------|`,
            bpmStart: 60,
            bpmTarget: 110,
            minutes: 8,
          },
          {
            id: "lg-resistencia",
            title: "Trino de resistencia 1-4",
            instructions: "Trino entre índice y meñique durante todo el tiempo. Para si notas dolor, no cansancio.",
            tab: `e|-------------------------------|
B|-5h8p5h8p5h8p5h8p5h8p5h8p5h8p5-|
G|-------------------------------|
D|-------------------------------|
A|-------------------------------|
E|-------------------------------|`,
            bpmStart: 60,
            bpmTarget: 120,
            minutes: 6,
          },
        ],
      },
    ],
  },
];

export interface ExerciseRef {
  technique: Technique;
  lesson: Lesson;
  exercise: Exercise;
}

const EXERCISE_INDEX = new Map<string, ExerciseRef>();
for (const technique of TECHNIQUES) {
  for (const lesson of technique.lessons) {
    for (const exercise of lesson.exercises) EXERCISE_INDEX.set(exercise.id, { technique, lesson, exercise });
  }
}

export function findExercise(id: string): ExerciseRef | null {
  return EXERCISE_INDEX.get(id) ?? null;
}

export function findTechnique(id: string): Technique | null {
  return TECHNIQUES.find((t) => t.id === id) ?? null;
}

export function techniqueExercises(t: Technique): Exercise[] {
  return t.lessons.flatMap((l) => l.exercises);
}
