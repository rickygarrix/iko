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
};

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <SearchContent messages={zh as Messages} />
    </Suspense>
  );
}