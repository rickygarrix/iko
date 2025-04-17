import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ReactNode } from "react";
import type { Messages } from "@/types/messages";

const locales = ["ja", "en", "zh", "ko"] as const;
type Locale = (typeof locales)[number];

import ja from "@/locales/ja.json";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import ko from "@/locales/ko.json";

const messagesMap: Record<Locale, Messages> = { ja, en, zh, ko };

export function generateStaticParams() {
  return ["ja", "en", "zh", "ko"].map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale as Locale;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = messagesMap[locale];

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* ── ヘッダー ─────────────────────── */}
      <Header locale={locale} messages={messages.header} />

      {/* ── ページ本体 ─────────────────── */}
      {children}

      {/* ── フッター ─────────────────────── */}
      <Footer locale={locale} messages={messages.footer} />
    </NextIntlClientProvider>
  );
}