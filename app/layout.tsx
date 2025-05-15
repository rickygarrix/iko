// app/layout.tsx
import "./globals.css";
import Script from "next/script";
import type { ReactNode } from "react";
import ScrollRestorationSetter from "@/components/ScrollRestorationSetter";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata = {
  title: "Otonavi",
  description: "夜の音楽ナビ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" data-scroll-restoring="true" style={{ opacity: 0 }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico?v=2" />
        <title>Otonavi - 夜の音楽ナビ</title>

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WEZPMCLCSW"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WEZPMCLCSW');
          `}
        </Script>
      </head>
      <body>
        <ScrollRestorationSetter />
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}