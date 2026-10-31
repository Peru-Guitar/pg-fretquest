import type { Metadata } from "next";
import BackstagePage from "@/views/Backstage";
import { pageMetadata } from "@/lib/seo";

// Página de admin: no se indexa.
export const metadata: Metadata = pageMetadata({ title: "Backstage", path: "/backstage", noindex: true });

export default function Page() {
  return <BackstagePage/>;
}
