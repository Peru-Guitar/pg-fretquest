import type { Metadata } from "next";
import { Suspense } from "react";
import LoginPage from "@/views/Login";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Entrar", path: "/login", noindex: true });

// Suspense: la vista lee ?repetir de la URL, que en la exportación estática se resuelve en el navegador.
export default function Page() {
  return <Suspense><LoginPage/></Suspense>;
}
