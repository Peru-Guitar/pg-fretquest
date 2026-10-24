import type { Metadata } from "next";
import HomePage from "@/views/Home";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ path: "/" });

export default function Page() {
  return <HomePage/>;
}
