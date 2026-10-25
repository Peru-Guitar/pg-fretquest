import type { Metadata } from "next";
import UserProfilePage from "@/views/UserProfile";
import { pageMetadata } from "@/lib/seo";

// Perfil de un usuario: no se indexa.
export const metadata: Metadata = pageMetadata({ title: "Perfil de usuario", path: "/perfil", noindex: true });

export default function Page() {
  return <UserProfilePage/>;
}
