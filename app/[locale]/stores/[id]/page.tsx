import { getDictionary } from "@/lib/getDictionary";
import type { StoreParams } from "@/types/params";
import { locales } from "@/types/params";
import StoreDetailPage from "@/components/StoreDetail/StoreDetail";

export function generateStaticParams(): StoreParams["params"][] {
  return locales.map((locale) => ({
    locale,
    id: "dummy", // 実際はISRで補完するかルールを追加
  }));
}

export default async function Page({ params }: StoreParams) {
  const { locale, id } = params;
  const dict = await getDictionary(locale);

  return (
    <StoreDetailPage
      id={id}
      locale={locale}
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