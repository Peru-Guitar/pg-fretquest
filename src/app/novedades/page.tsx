import type { Metadata } from "next";
import ChangelogPage from "@/views/Changelog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Novedades", path: "/novedades", noindex: true });

export default function Page() {
  return <ChangelogPage/>;
}
