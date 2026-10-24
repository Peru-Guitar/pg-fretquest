import { Navigate } from "@/lib/router";

// Cualquier ruta desconocida vuelve al inicio (también es la 404.html de GitHub Pages).
export default function NotFound() {
  return <Navigate to="/" replace/>;
}
