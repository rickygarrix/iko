import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JSX } from "react"; // ← JSX.Element を使うために必要
import HomeContent from "@/components/Home";
import type { Messages } from "@/types/messages";
import ja from "@/locales/ja.json";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import ko from "@/locales/ko.json";

// 利用可能なロケールを定義
const locales = ["ja", "en", "zh", "ko"] as const;
type Locale = (typeof locales)[number];

// メッセージマップ
const messagesMap: Record<Locale, Messages> = {
  ja,
  en,
  zh,
  ko,
};

// ✅ ① 静的ルート生成
export function generateStaticParams(): { locale: Locale }[] {
  return locales.map((locale) => ({ locale }));
}

// ✅ ② メタデータ
export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = params.locale as Locale;
  if (!locales.includes(locale)) notFound();

  const dict = messagesMap[locale];
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
    },
    twitter: {
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

// ✅ ③ ページ本体
export default async function Page({
  params,
}: {
  params: { locale: string };
}): Promise<JSX.Element> {
  const locale = params.locale as Locale;
  if (!locales.includes(locale)) notFound();

  const dict = messagesMap[locale];
  return (
    <main>
      <HomeContent messages={dict} />
    </main>
  );
}