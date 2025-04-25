// ✅ app/ko/page.tsx
import HomePage from "@/components/HomePage";
import ko from "@/locales/ko.json";
import type { Messages } from "@/types/messages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: ko.meta.title,
  description: ko.meta.description,
  openGraph: {
    title: ko.meta.title,
    description: ko.meta.description,
    url: "https://otnv.jp/ko",
  },
  twitter: {
    title: ko.meta.title,
    description: ko.meta.description,
    card: "summary",
  },
};

export default function Page() {
  return <HomePage locale="ko" messages={ko as Messages} />;
}