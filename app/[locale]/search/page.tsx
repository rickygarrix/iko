import SearchContent from "@/components/SearchPageContent";
import type { Messages } from "@/types/messages";
import type { LocaleParams } from "@/types/params";

import ja from "@/locales/ja.json";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import ko from "@/locales/ko.json";

const messagesMap: Record<LocaleParams["params"]["locale"], Messages> = {
  ja,
  en,
  zh,
  ko,
};

export default async function SearchPage({ params }: LocaleParams) {
  const dict = messagesMap[params.locale];
  return <SearchContent messages={dict} />;
}