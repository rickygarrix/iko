// app/lib/getDictionary.ts

type Locale = "ja" | "en" | "zh" | "ko"; // 対応する言語（あとで拡張できる）

export const getDictionary = async (locale: Locale) => {
  const dictionaries = {
    ja: () => import("@/messages/ja.json").then((module) => module.default),
    en: () => import("@/messages/en.json").then((module) => module.default),
    zh: () => import("@/messages/zh.json").then((module) => module.default),
    ko: () => import("@/messages/ko.json").then((module) => module.default),
  };

  return dictionaries[locale]();
};