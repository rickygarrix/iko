import { getDictionary } from "@/lib/getDictionary";
import { HomePage } from "@/components/HomePage";
import type { Metadata } from "next";

// ✅ 使用するロケールを明示的に制限
const locales = ["ja", "en", "zh", "ko"] as const;
type Locale = (typeof locales)[number];

// ✅ 明示的な型（Next.jsに静的だとわかるように）
type Props = {
  params: {
    locale: Locale; // ← string ではなく Union 型にするのがポイント！
  };
};

export function generateStaticParams(): Props["params"][] {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dict = await getDictionary(params.locale);
  return {
    title: dict.meta?.title ?? "Otonavi",
    description: dict.meta?.description ?? "",
  };
}

export default async function Page({ params }: Props) {
  const dict = await getDictionary(params.locale);
  return <HomePage locale={params.locale} messages={dict} />;
}