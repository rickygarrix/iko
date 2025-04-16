// lib/getDictionary.ts
import type { Locale } from "@/i18n/config";

export const getDictionary = async (locale: Locale) => {
  switch (locale) {
    case "en":
      return (await import("@/locales/en.json")).default;
    case "zh":
      return (await import("@/locales/zh.json")).default;
    case "ko":
      return (await import("@/locales/ko.json")).default;
    case "ja":
    default:
      return (await import("@/locales/ja.json")).default;
  }
};