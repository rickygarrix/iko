import { getRequestConfig } from "next-intl/server";
import type { RequestConfig } from "next-intl/server";
import type { Locale } from "./config";

import ja from "@/locales/ja.json";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import ko from "@/locales/ko.json";

const messages = { ja, en, zh, ko };

export default getRequestConfig(
  async ({ locale }): Promise<RequestConfig> => {
    // ✅ localeがundefinedのときのフォールバック
    if (!locale || !(locale in messages)) {
      return {
        messages: ja,
        locale: "ja",
      };
    }

    return {
      messages: messages[locale as Locale],
      locale: locale as Locale,
    };
  }
);