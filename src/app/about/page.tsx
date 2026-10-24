import type { Metadata } from "next";
import AboutPage from "@/views/About";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Acerca de", path: "/about" });

export default function Page() {
  return <AboutPage/>;
}
