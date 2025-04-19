// app/layout.tsx
import "./globals.css";
import Script from "next/script";
import type { ReactNode } from "react";

export const metadata = {
  title: "Otonavi",
  description: "夜の音楽ナビ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
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
      <body>{children}</body>
    </html>
  );
}