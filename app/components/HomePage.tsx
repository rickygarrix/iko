import ja from "@/locales/ja.json";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import ko from "@/locales/ko.json";
import type { Messages } from "@/types/messages";
import type { Locale } from "@/i18n/config";
import HomeContent from "@/components/Home";

const messagesMap: Record<Locale, Messages> = {
  ja: ja as Messages,
  en: en as Messages,
  zh: zh as Messages,
  ko: ko as Messages,
};

type Props = {
  locale: Locale;
  messages?: Messages; // 外部から渡す場合に備えてオプション化
};

export function HomePage({ locale, messages }: Props) {
  const dict = messages ?? messagesMap[locale];
  return <HomeContent messages={dict} />;
}