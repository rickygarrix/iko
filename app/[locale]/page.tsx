import { getDictionary } from "@/lib/getDictionary";
import { HomePage } from "@/components/HomePage";
import type { Locale } from "@/i18n/config";
import type { Metadata } from "next";

// SSRで常に最新データ取得（オプション）
export const dynamic = "force-dynamic";

// 型定義
type Props = {
  params: {
    locale: Locale;
  };
};

// メタデータ生成（i18n対応）
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dict = await getDictionary(params.locale);
  return {
    title: dict.meta?.title ?? "Otonavi",
    description: dict.meta?.description ?? "",
  };
}

// メインページ
export default async function Page({ params }: Props) {
  const dict = await getDictionary(params.locale);
  return <HomePage locale={params.locale} messages={dict} />;
}