import type { Metadata } from "next";
import RanksPage from "@/views/Ranks";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Rangos", description: "Los rangos de Fret Quest: suben con las horas que entrenas en la app. Una forma sana y divertida de medir tu dedicación.", path: "/rangos" });

export default function Page() {
  return <RanksPage/>;
}
