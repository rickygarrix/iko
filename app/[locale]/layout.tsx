import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ReactNode } from "react";
import type { Messages } from "@/types/messages";

// ロケール定義
const locales = ["ja", "en", "zh", "ko"] as const;
type Locale = (typeof locales)[number];

// JSON辞書
import ja from "@/locales/ja.json";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import ko from "@/locales/ko.json";

// 辞書Map
const messagesMap: Record<Locale, Messages> = {
  ja,
  en,
  zh,
  ko,
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale?: string };
}) {
  const locale = params?.locale;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = messagesMap[locale as Locale];

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header messages={messages.header} /> {/* ✅ ココ！ */}
      {children}
      <Footer messages={messages.footer} /> {/* ✅ ココ！ */}
    </NextIntlClientProvider>
  );
}