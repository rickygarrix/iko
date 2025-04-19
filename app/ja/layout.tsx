import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ja from "@/locales/ja.json";
import type { Messages } from "@/types/messages";
import type { ReactNode } from "react";

const messages: Messages = ja;

export default function JaLayout({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="ja" messages={messages}>
      <Header locale="ja" messages={messages.header} />
      {children}
      <Footer locale="ja" messages={messages.footer} />
    </NextIntlClientProvider>
  );
}