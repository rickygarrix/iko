// ✅ lib/staticParams.ts
import type { Locale } from "@/i18n/config";

export function generateStaticParams(): Array<{ locale: Locale }> {
  const locales = ["ja", "en", "zh", "ko"] as const;
  return locales.map((locale) => ({ locale }));
}