import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/geist-mono";
import "@/styles/globals.css";
import { AppShell } from "@/components/AppShell";
import { CopyGuard } from "@/components/CopyGuard";
import { pageMetadata, SITE_URL } from "@/lib/seo";

const GA_MEASUREMENT_ID = "G-WFJZZFCV16";

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
      <CopyGuard/>
      {process.env.NODE_ENV === "production" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}
          </Script>
        </>
      )}
    </body>
  </html>;
}
