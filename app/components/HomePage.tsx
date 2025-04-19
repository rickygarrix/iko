"use client";

import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/components/Home";
import type { Messages } from "@/types/messages";
import type { Locale } from "@/i18n/types";

type Props = {
  locale: Locale;
  messages: Messages;
};

export default function HomePage({ locale, messages }: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header locale={locale} messages={messages.header} />
      <Home messages={messages} locale={locale} /> {/* ✅ locale 渡す */}
    </NextIntlClientProvider>
  );
}