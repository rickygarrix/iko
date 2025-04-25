// ✅ app/en/page.tsx
import HomePage from "@/components/HomePage";
import en from "@/locales/en.json";
import type { Messages } from "@/types/messages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: en.meta.title,
  description: en.meta.description,
  openGraph: {
    title: en.meta.title,
    description: en.meta.description,
    url: "https://otnv.jp/en",
  },
  twitter: {
    title: en.meta.title,
    description: en.meta.description,
    card: "summary",
  },
};

export default function Page() {
  return <HomePage locale="en" messages={en as Messages} />;
}