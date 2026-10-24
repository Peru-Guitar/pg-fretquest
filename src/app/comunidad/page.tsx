import type { Metadata } from "next";
import CommunityPage from "@/views/Community";
import { pageMetadata } from "@/lib/seo";

// Página personal: no se indexa.
export const metadata: Metadata = pageMetadata({ title: "Comunidad", path: "/comunidad", noindex: true });

export default function Page() {
  return <CommunityPage/>;
}
