import type { Metadata } from "next";
import AccountPage from "@/views/Account";
import { pageMetadata } from "@/lib/seo";

// Página personal: no se indexa.
export const metadata: Metadata = pageMetadata({ title: "Mis datos", path: "/mi-cuenta", noindex: true });

export default function Page() {
  return <AccountPage/>;
}
