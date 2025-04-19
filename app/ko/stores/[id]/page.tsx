import { getDictionary } from "@/lib/getDictionary";
import StoreDetailPage from "@/components/StoreDetail/StoreDetail";
import type { Messages } from "@/types/messages";

type Props = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: Props) {
  const locale = "ko"; // 固定ロケール
  const dict = await getDictionary(locale);

  return (
    <StoreDetailPage
      id={params.id}
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