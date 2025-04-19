import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import zh from "@/locales/zh.json";
import type { Messages } from "@/types/messages";
import type { ReactNode } from "react";

const messages: Messages = zh;

export default function ZhLayout({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="zh" messages={messages}>
      <Header locale="zh" messages={messages.header} />
      {children}
      <Footer locale="zh" messages={messages.footer} />
    </NextIntlClientProvider>
  );
}