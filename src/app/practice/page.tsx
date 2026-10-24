import type { Metadata } from "next";
import { Suspense } from "react";
import PracticePage from "@/views/Practice";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Practicar", path: "/practice", noindex: true });

export default function Page() {
  return <Suspense><PracticePage/></Suspense>;
}
