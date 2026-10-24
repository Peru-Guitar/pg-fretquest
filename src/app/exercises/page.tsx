import { Navigate } from "@/lib/router";

// Ruta antigua: lleva a Ejercicios.
export default function Page() {
  return <Navigate to="/train" replace/>;
}
