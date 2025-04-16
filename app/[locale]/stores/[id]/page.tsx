import { type Locale } from "@/i18n/config";
import StoreDetailPage from "@/components/StoreDetail/StoreDetail";
import { getDictionary } from "@/lib/getDictionary"; // ← 追加

type Props = {
  params: {
    locale: Locale;
    id: string;
  };
};

export function generateStaticParams() {
  const locales: Locale[] = ["ja", "en", "zh", "ko"];
  return locales.map((locale) => ({
    locale,
    id: "dummy",
  }));
}

// ✅ ページ本体（messagesを取得して渡す）
export default async function Page({ params }: Props) {
  const dict = await getDictionary(params.locale);

  return (
    <StoreDetailPage
      id={params.id}
      locale={params.locale}
      messages={dict.storeDetail ?? {}}
    />
  );
}