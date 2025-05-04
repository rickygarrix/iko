import "./globals.css";
import Script from "next/script";
import type { ReactNode } from "react";

export const metadata = {
  title: "Otonavi",
  description: "夜の音楽ナビ",
  icons: {
    icon: "/favicon.ico?v=2", // キャッシュバスター付き
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
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
      <body>{children}</body>
    </html>
  );
}