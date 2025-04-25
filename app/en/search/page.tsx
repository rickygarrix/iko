// app/en/search/page.tsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import SearchContent from "@/components/SearchPageContent";
import en from "@/locales/en.json";
import type { Messages } from "@/types/messages";
import type { Metadata } from "next";
import { JSX } from "react";

export const metadata: Metadata = {
  title: en.meta.title,
  description: en.meta.description,
  openGraph: {
    title: en.meta.title,
    description: en.meta.description,
    url: "https://otnv.jp/en/search",
  },
  twitter: {
    title: en.meta.title,
    description: en.meta.description,
    card: "summary",
  },
};

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent messages={en as Messages} />
    </Suspense>
  );
}