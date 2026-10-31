'use client';

import { Navigate } from "@/lib/router";
import { ROUTES } from "@/lib/routes";

// Antes se llamaba Analytics: los enlaces viejos llevan a Backstage.
export default function Page() {
  return <Navigate to={ROUTES.backstage} replace/>;
}
