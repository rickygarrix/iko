import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ko from "@/locales/ko.json";
import type { Messages } from "@/types/messages";
import type { ReactNode } from "react";

const messages: Messages = ko;

export default function KoLayout({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="ko" messages={messages}>
      <Header locale="ko" messages={messages.header} />
      {children}
      <Footer locale="ko" messages={messages.footer} />
    </NextIntlClientProvider>
  );
}