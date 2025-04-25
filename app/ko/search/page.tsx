// app/ko/search/page.tsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import SearchContent from "@/components/SearchPageContent";
import ko from "@/locales/ko.json";
import type { Messages } from "@/types/messages";
import type { Metadata } from "next";
import { JSX } from "react";

export const metadata: Metadata = {
  title: ko.meta.title,
  description: ko.meta.description,
  openGraph: {
    title: ko.meta.title,
    description: ko.meta.description,
    url: "https://otnv.jp/ko/search",
  },
  twitter: {
    title: ko.meta.title,
    description: ko.meta.description,
    card: "summary",
  },
};

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SearchContent messages={ko as Messages} />
    </Suspense>
  );
}