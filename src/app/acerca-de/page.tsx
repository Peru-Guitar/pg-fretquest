import type { Metadata } from "next";
import AboutPage from "@/views/About";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Acerca de", path: "/acerca-de" });

export default function Page() {
  return <AboutPage/>;
}
