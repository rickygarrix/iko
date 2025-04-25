// ✅ app/zh/page.tsx
import HomePage from "@/components/HomePage";
import zh from "@/locales/zh.json";
import type { Messages } from "@/types/messages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: zh.meta.title,
  description: zh.meta.description,
  openGraph: {
    title: zh.meta.title,
    description: zh.meta.description,
    url: "https://otnv.jp/zh",
  },
  twitter: {
    title: zh.meta.title,
    description: zh.meta.description,
    card: "summary",
  },
};

export default function Page() {
  return <HomePage locale="zh" messages={zh as Messages} />;
}
