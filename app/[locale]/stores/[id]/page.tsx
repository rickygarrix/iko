import { getDictionary } from "@/lib/getDictionary";
import type { Locale } from "@/i18n/config";
import StoreDetailPage from "@/components/StoreDetail/StoreDetail";

// static params
export function generateStaticParams() {
  const locales: Locale[] = ["ja", "en", "zh", "ko"];
  return locales.map((locale) => ({
    locale,
    id: "dummy", // 実際のビルドでは使われない placeholder
  }));
}

type Props = {
  params: {
    locale: string;
    id: string;
  };
};

export default async function Page({ params }: Props) {
  const { locale, id } = params;

  const dict = await getDictionary(locale as Locale);

  return (
    <StoreDetailPage
      id={id}
      locale={locale as Locale}
      messages={{
        ...dict.storeDetail,
        genre: dict.storeDetail.genre,
        area: dict.searchFilter.area,
        open: dict.recommend.open,
        closed: dict.recommend.closed,
        nextOpen: dict.recommend.nextOpen,
      }}
    />
  );
}