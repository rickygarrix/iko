"use client";

import { NextIntlClientProvider } from "next-intl";
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

      <Home messages={messages} locale={locale} /> {/* ✅ locale 渡す */}
    </NextIntlClientProvider>
  );
}