import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";
import GoogleMapsProvider from "@/components/GoogleMapsProvider"; // ✅ GoogleMapsProvider を修正

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "オトナビ - 夜の音楽ガイド",
  description: "音楽スポットを見つけよう",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <GoogleMapsProvider> {/* ✅ `GoogleMapsProvider` を `<html>` の中に移動 */}
      <html lang="ja">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </body>
      </html>
    </GoogleMapsProvider>
  );
}