export const locales = ["ja", "en", "zh", "ko"] as const;
export const defaultLocale = "ja";
export type Locale = (typeof locales)[number];