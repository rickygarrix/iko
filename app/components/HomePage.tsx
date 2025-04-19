// components/HomePage.tsx
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeContent from "@/components/Home";
import ja from "@/locales/ja.json";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import ko from "@/locales/ko.json";
import type { Messages } from "@/types/messages";
import type { Locale } from "@/i18n/config";

const messagesMap: Record<Locale, Messages> = {
  ja,
  en,
  zh,
  ko,
};

export function HomePage({ locale }: { locale: Locale }) {
  const messages = messagesMap[locale];

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header locale={locale} messages={messages.header} />
      <HomeContent messages={messages} />
      <Footer locale={locale} messages={messages.footer} />
    </NextIntlClientProvider>
  );
}