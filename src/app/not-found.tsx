import { Navigate } from "@/lib/router";

// Ruta desconocida (también es la 404.html de GitHub Pages): vuelve al inicio.
export default function NotFound() {
  return <Navigate to="/" replace/>;
}
