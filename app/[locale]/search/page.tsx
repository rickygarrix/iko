// app/[locale]/search/page.tsx

import SearchContent from "@/components/SearchPageContent";
import { notFound } from "next/navigation";
import type { Messages } from "@/types/messages";

import ja from "@/locales/ja.json";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import ko from "@/locales/ko.json";

const locales = ["ja", "en", "zh", "ko"] as const;
type Locale = (typeof locales)[number];

const messagesMap: Record<Locale, Messages> = {
  ja,
  en,
  zh,
  ko,
};

export default function SearchPage({
  params,
}: {
  params: { locale?: string };
}) {
  const locale = params?.locale;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = messagesMap[locale as Locale];

  return <SearchContent messages={dict} />;
}
