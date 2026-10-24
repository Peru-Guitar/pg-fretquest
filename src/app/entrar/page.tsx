import type { Metadata } from "next";
import LoginPage from "@/views/Login";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Entrar", path: "/entrar", noindex: true });

export default function Page() {
  return <LoginPage/>;
}
