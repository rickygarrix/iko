import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import en from "@/locales/en.json";
import type { Messages } from "@/types/messages";
import type { ReactNode } from "react";

const messages: Messages = en;

export default function EnLayout({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <Header locale="en" messages={messages.header} />
      {children}
      <Footer locale="en" messages={messages.footer} />
    </NextIntlClientProvider>
  );
}