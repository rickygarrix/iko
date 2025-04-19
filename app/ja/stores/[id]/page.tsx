// app/en/stores/[id]/page.tsx
import { getDictionary } from "@/lib/getDictionary";
import StoreDetailPage from "@/components/StoreDetail/StoreDetail";
import type { Metadata } from "next";

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const dict = await getDictionary("ja");    // ← "ja"→"en" に変更
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function Page({ params }: PageProps) {
  const dict = await getDictionary("ja");    // ← 同じく "en"
  return (
    <StoreDetailPage
      id={params.id}
      locale="ja"                            // ← prop locale も "en"
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