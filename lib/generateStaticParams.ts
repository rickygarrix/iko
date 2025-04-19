// "@/lib/generateStaticParams.ts"
import type { Locale } from "@/i18n/config";

export async function generateStaticParams(): Promise<{ locale: Locale }[]> {
  return [
    { locale: "ja" },
    { locale: "en" },
    { locale: "zh" },
    { locale: "ko" },
  ];
}