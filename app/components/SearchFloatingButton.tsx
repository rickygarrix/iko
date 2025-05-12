"use client";

import { useState } from "react";
import Image from "next/image";
import SlideDownModal from "@/components/SlideDownModal";
import SearchFilter from "@/components/SearchFilter";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { checkIfOpen } from "@/lib/utils";
import type { Messages } from "@/types/messages";
import useSWR from "swr";

type Props = {
  messages: Messages["searchFilter"];
  genres: { [key: string]: string };
  areas: { [key: string]: string };
};

export default function SearchFloatingButton({ messages, genres, areas }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ja";

  const [isOpen, setIsOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);

  // ✅ 件数取得
  const fetchPreviewCount = async (
    genres: string[],
    areas: string[],
    payments: string[],
    openOnly: boolean
  ): Promise<number> => {
    let query = supabase.from("stores").select("*").eq("is_published", true);

    if (genres.length > 0) query = query.filter("genre_ids", "cs", JSON.stringify(genres));
    if (areas.length > 0) query = query.in("area_id", areas);
    if (payments.length > 0) query = query.overlaps("payment_method_ids", payments);

    const { data, error } = await query;
    if (error || !data) return 0;

    const filtered = openOnly ? data.filter((s) => checkIfOpen(s.opening_hours).isOpen) : data;
    return filtered.length;
  };

  const { data: previewCount } = useSWR(
    ["floatingPreviewCount", selectedGenres, selectedAreas, selectedPayments, showOnlyOpen],
    ([, genres, areas, payments, openOnly]) =>
      fetchPreviewCount(genres, areas, payments, openOnly),
    { revalidateOnFocus: false }
  );

  // ✅ 検索押下 → クエリ付きで /search に遷移
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedGenres.length > 0) params.set("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.set("area", selectedAreas.join(","));
    if (selectedPayments.length > 0) params.set("payment", selectedPayments.join(","));
    if (showOnlyOpen) params.set("open", "true");

    // sessionStorage に条件を保存（サーチ画面で使えるように）
    sessionStorage.setItem("filterGenres", JSON.stringify(selectedGenres));
    sessionStorage.setItem("filterAreas", JSON.stringify(selectedAreas));
    sessionStorage.setItem("filterPayments", JSON.stringify(selectedPayments));
    sessionStorage.setItem("filterOpen", JSON.stringify(showOnlyOpen));

    setIsOpen(false);
    router.push(`/${locale}/search?${params.toString()}`);
  };

  return (
    <>
      {/* ✅ フローティング虫眼鏡アイコン */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[72px] right-4 z-[900] w-14 h-14 bg-white rounded-2xl shadow-md border border-gray-300 flex items-center justify-center"
      >
        <Image src="/header/search.svg" alt="検索" width={24} height={24} />
      </button>

      {/* ✅ モーダル本体 */}
      <SlideDownModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <SearchFilter
          selectedGenres={selectedGenres}
          setSelectedGenres={setSelectedGenres}
          selectedAreas={selectedAreas}
          setSelectedAreas={setSelectedAreas}
          selectedPayments={selectedPayments}
          setSelectedPayments={setSelectedPayments}
          showOnlyOpen={showOnlyOpen}
          setShowOnlyOpen={setShowOnlyOpen}
          handleSearch={handleSearch}
          previewCount={previewCount ?? 0}
          showTitle={true}
          messages={{
            ...messages,
            genres,
            areas,
            payments: {}, // 今回支払いフィルター不要
          }}
        />
      </SlideDownModal>
    </>
  );
}