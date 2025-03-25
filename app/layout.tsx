import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-[#FAFAF5]`}>
        <GoogleMapsProvider>
          <Header />

          {/* 👇 全幅で表示 */}
          <main className="flex-grow w-full">
            {children}
          </main>

          <Footer />
        </GoogleMapsProvider>
      </body>
    </html>
  );
}