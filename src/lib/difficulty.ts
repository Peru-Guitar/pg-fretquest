import type { Difficulty } from "@/data/questMock";

/** Dificultad de cada ejercicio: su nombre visible. */
export const DIFFICULTY: Record<Difficulty, { label: string }> = {
  base: { label: "Básico" },
  intermedio: { label: "Intermedio" },
  avanzado: { label: "Avanzado" },
  experto: { label: "Experto" },
};
