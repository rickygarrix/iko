// 共通ロケール定義（configと揃える）
export const locales = ["ja", "en", "zh", "ko"] as const;
export type Locale = (typeof locales)[number];

// 各ページのparams用型
export type LocaleParams = {
  params: {
    locale: Locale;
  };
};

export type StoreParams = {
  params: {
    locale: Locale;
    id: string;
  };
};