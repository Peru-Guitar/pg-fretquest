import type { Metadata } from "next";
import PlanPage from "@/views/Plan";
import { pageMetadata } from "@/lib/seo";

// Página personal: no se indexa.
export const metadata: Metadata = pageMetadata({ title: "Mi plan", path: "/plan", noindex: true });

export default function Page() {
  return <PlanPage/>;
}
