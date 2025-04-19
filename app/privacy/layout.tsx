import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ja from "@/locales/ja.json";

export const metadata = {
  title: ja.meta.title,
  description: ja.meta.description,
};

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header locale="ja" messages={ja.header} />
      {children}
      <Footer locale="ja" messages={ja.footer} />
    </>
  );
}