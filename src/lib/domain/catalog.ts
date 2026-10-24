/**
 * Ruta de aprendizaje: Nivel → Lección → Ejercicio.
 * Las tablaturas usan seis líneas (e B G D A E) en texto monoespaciado.
 */
import type { Picking } from "./tab";

export interface Exercise {
  id: string;
  title: string;
  technique: string;
  objective: string;
  description: string;
  /** Instrucciones de ejecución, en orden. */
  steps: string[];
  tips: string[];
  mistakes: string[];
  tab: string;
  /** Tempo de arranque y tempo objetivo (negras por minuto). */
  bpmStart: number;
  bpmTarget: number;
  /** Notas por pulso al reproducir: 4 = semicorcheas (por defecto), 3 = tresillos. */
  notesPerBeat?: number;
  /** Dirección de púa que se dibuja sobre cada golpe. */
  picking?: Picking;
}

export interface Lesson {
  id: string;
  title: string;
  exercises: Exercise[];
}

export interface Level {
  number: number;
  title: string;
  /** Rango del guitarrista mientras está en este nivel. */
  rank: string;
  goal: string;
  lessons: Lesson[];
}

/** Lick de relleno (pentatónica de Am) mientras se escriben los ejercicios reales. */
const PLACEHOLDER_TAB = `e|-----------------5-8-5-----|
B|-----------5-8---------8-5-|
G|-----5-7-------------------|
D|-5-7-----------------------|
A|---------------------------|
E|---------------------------|`;

function placeholderExercises(lessonId: string): Exercise[] {
  return [1, 2].map((n) => ({
    id: `${lessonId}-${n}`,
    title: `Ejercicio ${n}`,
    technique: "Alternate picking",
    objective: "Mejorar la coordinación, precisión y sincronización de ambas manos.",
    description: "Ejercicio provisional: lick de pentatónica de Am tocado con púa alternada estricta. Se reemplazará por el ejercicio propio de esta lección.",
    steps: [
      "Afina la guitarra y activa el metrónomo a 60 BPM.",
      "Toca una nota por clic (negras) hasta que suene limpio; luego pasa a corcheas y semicorcheas.",
      "Alterna la púa abajo-arriba en cada nota, también al cambiar de cuerda.",
      "Sube el tempo de 5 en 5 BPM solo cuando completes tres repeticiones limpias seguidas.",
    ],
    tips: [
      "Mantén la muñeca relajada y la púa con poca superficie fuera de los dedos.",
      "Deja los dedos de la mano izquierda cerca del diapasón entre nota y nota.",
      "Apaga las cuerdas que no tocas con la palma derecha y los dedos libres.",
    ],
    mistakes: [
      "Subir el tempo antes de que el ejercicio suene limpio.",
      "Romper la alternancia de púa al cambiar de cuerda.",
      "Tensar el hombro o el antebrazo para ganar velocidad.",
    ],
    tab: PLACEHOLDER_TAB,
    bpmStart: 60,
    bpmTarget: 120,
    picking: "alternate",
  }));
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function level(number: number, title: string, rank: string, goal: string, lessonTitles: string[]): Level {
  return {
    number,
    title,
    rank,
    goal,
    lessons: lessonTitles.map((t) => {
      const id = `n${number}-${slug(t)}`;
      return { id, title: t, exercises: placeholderExercises(id) };
    }),
  };
}

export const LEVELS: Level[] = [
  level(1, "Fundamentos técnicos", "Principiante", "Desarrollar coordinación, limpieza y control de ambas manos.", [
    "Postura, posición de manos y uso de la púa",
    "Alternate picking básico",
    "Ejercicios cromáticos 1-2-3-4",
    "Independencia y coordinación de los cuatro dedos",
    "Trémolo picking sobre una cuerda",
    "Ejercicios de sincronización de ambas manos",
    "Cambios de cuerda básicos",
    "Control de ruido y muting",
  ]),
  level(2, "Cambios de cuerda y coordinación", "Aprendiz", "Dominar los movimientos de púa entre cuerdas.", [
    "Alternate picking en múltiples cuerdas",
    "Outside picking",
    "Inside picking",
    "Saltos de cuerda (string skipping)",
    "Patrones de dos notas por cuerda",
    "Patrones de tres notas por cuerda",
    "Introducción al economy picking",
    "Ejercicios de precisión con metrónomo",
  ]),
  level(3, "Legato y escalas", "Intermedio", "Desarrollar fluidez y fuerza en la mano izquierda.", [
    "Hammer-on y pull-off",
    "Legato ascendente y descendente",
    "Trinos y resistencia muscular",
    "Slides y cambios de posición",
    "Legato con tres notas por cuerda",
    "Secuencias de escalas en grupos de tres y cuatro",
    "Patrones de quintillos y seisillos",
    "Combinación de picking y legato",
  ]),
  level(4, "Expresión y articulación", "Expresivo", "Controlar la afinación, dinámica y expresividad.", [
    "Bending de medio tono, un tono y tono y medio",
    "Bending con afinación controlada",
    "Pre-bends y release bends",
    "Vibrato de muñeca y dedos",
    "Vibrato combinado con bending",
    "Armónicos naturales y artificiales (pinch harmonics)",
    "Palm muting y control dinámico",
    "Articulación y limpieza en frases rápidas",
  ]),
  level(5, "Arpegios, sweep picking y tapping", "Solista moderno", "Incorporar técnicas modernas de guitarra solista.", [
    "Arpegios con alternate picking",
    "Sweep picking de tres cuerdas",
    "Sweep picking de cinco cuerdas",
    "Sweep picking ascendente y descendente",
    "Economy picking aplicado a arpegios",
    "Tapping básico sobre una cuerda",
    "Tapping con desplazamientos",
    "Tapping sobre múltiples cuerdas",
    "Arpegios combinando sweep y tapping",
    "Tapping a dos manos",
  ]),
  level(6, "Velocidad y resistencia", "Shredder", "Aumentar la velocidad sin perder precisión ni limpieza.", [
    "Desarrollo de velocidad con metrónomo",
    "Speed bursts (ráfagas de velocidad)",
    "Alternate picking de alta velocidad",
    "Legato de resistencia",
    "Secuencias de tres, cuatro y seis notas",
    "Cambios de cuerda a alta velocidad",
    "Trinos de resistencia",
    "Arpegios rápidos con economy picking",
    "Combinación de picking, legato y tapping",
    "Control de tensión y relajación muscular",
  ]),
  level(7, "Técnicas avanzadas", "Avanzado", "Combinar técnicas complejas con precisión y fluidez.", [
    "Sweep picking con progresiones de arpegios",
    "Arpegios extendidos de cinco y seis cuerdas",
    "String skipping avanzado",
    "Hybrid picking",
    "Tapping de múltiples dedos",
    "Arpegios a dos manos",
    "Legato con intervalos amplios",
    "Combinaciones de sweep, tapping y legato",
    "Quintillos y septillos a alta velocidad",
    "Cambios de técnica dentro de una misma frase",
  ]),
  level(8, "Dominio técnico", "Maestro", "Integrar todas las técnicas en ejecuciones musicales exigentes.", [
    "Frases largas combinando múltiples técnicas",
    "Cambios de articulación a alta velocidad",
    "Control de dinámicas en pasajes complejos",
    "Ejercicios de resistencia prolongada",
    "Sincronización extrema de ambas manos",
    "Desplazamientos amplios por el mástil",
    "Precisión rítmica en patrones irregulares",
    "Limpieza y control de ruido a alta velocidad",
    "Desarrollo de rutinas técnicas personalizadas",
    "Ejecución de estudios técnicos completos",
  ]),
];

export interface LessonRef {
  level: Level;
  lesson: Lesson;
  /** Lección anterior y siguiente en el orden de la ruta. */
  prev: Lesson | null;
  next: Lesson | null;
}

export interface ExerciseRef {
  level: Level;
  lesson: Lesson;
  exercise: Exercise;
}

const ORDER = LEVELS.flatMap((level) => level.lessons.map((lesson) => ({ level, lesson })));

export function findLesson(id: string): LessonRef | null {
  const i = ORDER.findIndex((x) => x.lesson.id === id);
  if (i === -1) return null;
  return { ...ORDER[i], prev: ORDER[i - 1]?.lesson ?? null, next: ORDER[i + 1]?.lesson ?? null };
}

export function findExercise(id: string): ExerciseRef | null {
  for (const { level, lesson } of ORDER) {
    const exercise = lesson.exercises.find((e) => e.id === id);
    if (exercise) return { level, lesson, exercise };
  }
  return null;
}
