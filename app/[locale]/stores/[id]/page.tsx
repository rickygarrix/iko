// app/[locale]/stores/[id]/page.tsx
import { getDictionary } from "@/lib/getDictionary";
import type { Locale } from "@/i18n/config";
import StoreDetailPage from "@/components/StoreDetail/StoreDetail";

// static params
export function generateStaticParams() {
  const locales: Locale[] = ["ja", "en", "zh", "ko"];
  return locales.map((locale) => ({
    locale,
    id: "dummy",
  }));
}

type Props = {
  params: {
    locale: Locale;
    id: string;
  };
};

export default async function Page({ params }: Props) {
  const dict = await getDictionary(params.locale);

  return (
    <StoreDetailPage
      id={params.id}
      locale={params.locale}
      messages={{
        ...dict.storeDetail,
        genre: dict.storeDetail.genre,
        area: dict.searchFilter.area, // ✅ area は searchFilter 由来
        open: dict.recommend.open,
        closed: dict.recommend.closed,
        nextOpen: dict.recommend.nextOpen,
      }}
    />
  );
}
