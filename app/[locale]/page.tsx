import { getDictionary } from "@/lib/getDictionary";
import { HomePage } from "@/components/HomePage";
import type { Locale } from "@/i18n/config";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// ✅ `PageProps` 型ではなく、Next.js の `params` を明示的に定義
type Props = {
  params: {
    locale: string; // ← 注意：ここでは string にしておく
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dict = await getDictionary(params.locale as Locale); // キャストでOK
  return {
    title: dict.meta?.title ?? "Otonavi",
    description: dict.meta?.description ?? "",
  };
}

export default async function Page({ params }: Props) {
  const dict = await getDictionary(params.locale as Locale);
  return <HomePage locale={params.locale as Locale} messages={dict} />;
}