import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/** Proyecto de Firebase de Fret Quest (la config de una app web es pública; los datos los protegen las reglas). */
const firebaseConfig = {
  apiKey: "AIzaSyALrZt5iryWpfuIiZgkdRAtzyulghKgJAI",
  authDomain: "fretquest-d02c2.firebaseapp.com",
  projectId: "fretquest-d02c2",
  storageBucket: "fretquest-d02c2.firebasestorage.app",
  messagingSenderId: "701070157338",
  appId: "1:701070157338:web:fda120f2583789345ad3a3",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = "es";
export const db = getFirestore(app);
