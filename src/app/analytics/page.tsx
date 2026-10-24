import type { Metadata } from "next";
import AnalyticsPage from "@/views/Analytics";
import { pageMetadata } from "@/lib/seo";

// Página de admin: no se indexa.
export const metadata: Metadata = pageMetadata({ title: "Analytics", path: "/analytics", noindex: true });

export default function Page() {
  return <AnalyticsPage/>;
}
