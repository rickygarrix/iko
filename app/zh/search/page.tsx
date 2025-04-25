// app/zh/search/page.tsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import SearchContent from "@/components/SearchPageContent";
import zh from "@/locales/zh.json";
import type { Messages } from "@/types/messages";
import type { Metadata } from "next";
import { JSX } from "react";

export const metadata: Metadata = {
  title: zh.meta.title,
  description: zh.meta.description,
  openGraph: {
    title: zh.meta.title,
    description: zh.meta.description,
    url: "https://otnv.jp/zh/search",
  },
  twitter: {
    title: zh.meta.title,
    description: zh.meta.description,
    card: "summary",
  },
};

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <SearchContent messages={zh as Messages} />
    </Suspense>
  );
}
