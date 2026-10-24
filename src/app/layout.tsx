import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/geist-mono";
import "@/styles/globals.css";
import { AppShell } from "@/components/AppShell";
import { pageMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({ path: "/" }),
  applicationName: "Fret Quest",
  manifest: "/manifest.webmanifest",
  icons: { icon: { url: "/icons/quest-mark.svg", type: "image/svg+xml" }, apple: "/icons/icon-192.png" },
  appleWebApp: { capable: true, title: "FretQuest" },
};

export const viewport: Viewport = { themeColor: "#111111", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es">
    <body className="font-sans antialiased">
      <AppShell>{children}</AppShell>
      <Script src="https://cloud.umami.is/script.js" data-website-id="29b1233a-223e-4588-aa58-96caea920b7b" data-domains="fretquest.peruguitar.com" strategy="afterInteractive"/>
    </body>
  </html>;
}
