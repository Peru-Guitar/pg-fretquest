import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/geist-mono";
import "@/styles/globals.css";
import { AppShell } from "@/components/AppShell";
import { CopyGuard } from "@/components/CopyGuard";
import { LinkTracker } from "@/components/LinkTracker";
import { pageMetadata, SITE_URL } from "@/lib/seo";

const GA_MEASUREMENT_ID = "G-WFJZZFCV16";
const CLARITY_PROJECT_ID = "zfut5gvumc";

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
      <LinkTracker/>
      {process.env.NODE_ENV === "production" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}
          </Script>
          <Script id="clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_PROJECT_ID}");`}
          </Script>
        </>
      )}
    </body>
  </html>;
}
