// app/stores/[id]/layout.tsx
import React from "react";
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ja from "@/locales/ja.json";
import type { Messages } from "@/types/messages";

const messages: Messages = ja;

export default function StoreDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="ja" messages={messages}>
      {/* Header コンポーネント */}
      <Header locale="ja" messages={messages.header} />

      {/* 実際のストア詳細ページ */}
      <main>{children}</main>

      {/* Footer コンポーネント */}
      <Footer locale="ja" messages={messages.footer} />
    </NextIntlClientProvider>
  );
}