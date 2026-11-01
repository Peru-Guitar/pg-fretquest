import { collection, doc, getDoc, getDocs, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { weekStartKey } from "@/lib/progressDb";
import { applyPractice, buildProgress, type FinishedPractice, type ProgressReport, type SourceDay } from "@/lib/domain/progressReport";

/**
 * Reporte de progreso en Firestore: `progressReports/{uid}` (ver `domain/progressReport`). Se crea con la primera
 * práctica; quien ya practicaba antes de que existiera se arma desde sus días (aquí al practicar, o desde Backstage).
 */
const progressRef = (uid: string) => doc(db, "progressReports", uid);

/** El reporte de progreso de un usuario (null si todavía no practicó). */
export async function readProgress(uid: string) {
  const snapshot = await getDoc(progressRef(uid));
  return snapshot.exists() ? snapshot.data() as ProgressReport : null;
}

const readSourceDays = async (uid: string) => (await getDocs(collection(db, "users", uid, "days"))).docs.map(item => item.data() as SourceDay);

/** Rearma el reporte de un usuario desde todos sus días y lo reescribe completo. */
async function rebuildProgress(uid: string) {
  const report = buildProgress(await readSourceDays(uid), weekStartKey());
  await setDoc(progressRef(uid), { ...report, updatedAt: serverTimestamp() });
}

/**
 * Al terminar una lección (con la práctica ya guardada en su día): lee el reporte, le suma la práctica y lo reescribe,
 * en una transacción para que dos pestañas no se pisen. Si no existe, se arma desde los días, que ya la incluyen.
 */
export async function addPracticeToProgress(uid: string, practice: FinishedPractice) {
  const exists = await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(progressRef(uid));
    if (!snapshot.exists()) return false;
    transaction.set(progressRef(uid), { ...applyPractice(snapshot.data() as ProgressReport, practice, weekStartKey()), updatedAt: serverTimestamp() });
    return true;
  });
  if (!exists) await rebuildProgress(uid);
}

/** Backstage: rearma el reporte de todos los que practicaron, uno por uno, avisando el avance. */
export async function rebuildAllProgress(onProgress: (done: number, total: number) => void) {
  const users = (await getDocs(collection(db, "users"))).docs.filter(user => ((user.get("totalSeconds") as number | undefined) ?? 0) > 0);
  onProgress(0, users.length);
  for (const [index, user] of users.entries()) {
    await rebuildProgress(user.id);
    onProgress(index + 1, users.length);
  }
  return users.length;
}
