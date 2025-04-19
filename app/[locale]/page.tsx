// ✅ app/[locale]/page.tsx
import { HomePage } from "@/components/HomePage";
import type { Locale } from "@/i18n/config";
import type { Metadata } from "next";
import ja from "@/locales/ja.json";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import ko from "@/locales/ko.json";

const messagesMap = { ja, en, zh, ko } as const satisfies Record<Locale, typeof ja>;

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const dict = messagesMap[params.locale];
  return {
    title: dict.meta?.title ?? "Otonavi",
    description: dict.meta?.description ?? "",
  };
}

export default function Page({ params }: { params: { locale: Locale } }) {
  return <HomePage locale={params.locale} />;
}
