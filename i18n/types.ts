// i18n/types.ts
export const locales = ["ja", "en", "zh", "ko"] as const;
export type Locale = (typeof locales)[number];