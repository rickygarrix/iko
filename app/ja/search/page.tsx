export const dynamic = "force-dynamic";

import { Suspense } from "react";
import SearchContent from "@/components/SearchPageContent";
import ja from "@/locales/ja.json";
import type { Messages } from "@/types/messages";
import type { Metadata } from "next";
import { JSX } from "react";

export const metadata: Metadata = {
  title: ja.meta.title,
  description: ja.meta.description,
  openGraph: {
    title: ja.meta.title,
    description: ja.meta.description,
    url: "https://otnavi.vercel.app/ja/search", // ✅本番ドメインに合わせて後で修正可
    siteName: "オトナビ",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://otnavi.vercel.app/ogp.jpg", // ✅後でOGP画像用意＆修正
        width: 1200,
        height: 630,
        alt: "オトナビ - 音楽と夜遊びのスポット検索",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ja.meta.title,
    description: ja.meta.description,
    images: ["https://otnavi.vercel.app/ogp.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <SearchContent messages={ja as Messages} />
    </Suspense>
  );
}