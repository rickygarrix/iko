import StoreDetail from "@/components/StoreDetail/StoreDetail";
import ja from "@/locales/ja.json";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import ko from "@/locales/ko.json";

const dictionaries = { ja, en, zh, ko } as const;

type Locale = keyof typeof dictionaries;

type Props = {
  params: { locale: string };
};

export default async function Page({ params }: Props) {
  const locale = params.locale as Locale;
  const messages = dictionaries[locale] || dictionaries.ja;

  return <StoreDetail messages={messages.storeDetail ?? {}} />;
}