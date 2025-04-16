// i18n/config.ts
export const locales = ["ja", "en", "zh", "ko"] as const;
export type Locale = (typeof locales)[number];