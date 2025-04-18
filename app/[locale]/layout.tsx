import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ReactNode } from "react";
import type { Messages } from "@/types/messages";

export const dynamic = "force-dynamic"; // 念のため入れておくと安心

// 対応ロケール定義
const locales = ["ja", "en", "zh", "ko"] as const;
type Locale = (typeof locales)[number];

// ローカル翻訳ファイル
import ja from "@/locales/ja.json";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import ko from "@/locales/ko.json";

// ロケール別メッセージマップ
const messagesMap: Record<Locale, Messages> = {
  ja,
  en,
  zh,
  ko,
};

// static path対応

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = messagesMap[locale as Locale];

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header locale={locale as Locale} messages={messages.header} />
      {children}
      <Footer locale={locale as Locale} messages={messages.footer} />
    </NextIntlClientProvider>
  );
}