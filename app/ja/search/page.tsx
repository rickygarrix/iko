export const dynamic = "force-dynamic";

import { Suspense } from "react";
import SearchContent from "@/components/SearchPageContent";
import ja from "@/locales/ja.json";
import type { Messages } from "@/types/messages";
import type { Metadata } from "next";
import { JSX } from "react";

export const metadata: Metadata = {
  title: ja.meta.title,
  description: ja.meta.description,
};

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <SearchContent messages={ja as Messages} />
    </Suspense>
  );
}