import HomePage from "@/components/HomePage";
import ja from "@/locales/ja.json";
import type { Messages } from "@/types/messages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: ja.meta.title,
  description: ja.meta.description,
  openGraph: {
    title: ja.meta.title,
    description: ja.meta.description,
    url: "https://otnv.jp/ja",
    siteName: "オトナビ",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: ja.meta.title,
    description: ja.meta.description,
  },
};

export default function Page() {
  return <HomePage locale="ja" messages={ja as Messages} />;
}
