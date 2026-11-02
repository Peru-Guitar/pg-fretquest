import { createLocalStore } from "@/lib/localStore";

/** Último ejercicio abierto, para retomarlo desde el inicio. Es lo único que se recuerda de la práctica. */
const lastExercise = createLocalStore<{ moduleId: string; exerciseId: string } | null>("fretquest.lastExercise", null);
export const useLastExercise = lastExercise.use;
export const setLastExercise = lastExercise.set;
