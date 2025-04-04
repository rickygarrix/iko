"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchFilter from "@/components/SearchFilter";
import SearchResults from "@/components/SearchResults";
import { supabase } from "@/lib/supabase";
import useSWR from "swr";

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);
  const [isSearchTriggered, setIsSearchTriggered] = useState<boolean>(false);

  // 🔥 プレビュー件数取得
  const fetchPreviewCount = async (
    selectedGenres: string[],
    selectedAreas: string[],
    selectedPayments: string[]
  ): Promise<number> => {
    let query = supabase.from("stores").select("*", { count: "exact", head: true });

    if (selectedGenres.length > 0) query = query.in("genre", selectedGenres);
    if (selectedAreas.length > 0) query = query.in("area", selectedAreas);
    if (selectedPayments.length > 0) query = query.overlaps("payment_methods", selectedPayments);

    const { count, error } = await query;

    if (error || typeof count !== "number") {
      throw new Error(error?.message || "カウント取得エラー");
    }

    return count;
  };

  const { data: previewCount } = useSWR(
    ["previewCount", selectedGenres, selectedAreas, selectedPayments],
    ([, selectedGenres, selectedAreas, selectedPayments]) =>
      fetchPreviewCount(selectedGenres, selectedAreas, selectedPayments),
    { revalidateOnFocus: false }
  );

  // 🔥 ページロード時のフィルター復元 or リセット
  useEffect(() => {
    const genres = searchParams.get("genre")?.split(",") || [];
    const areas = searchParams.get("area")?.split(",") || [];
    const payments = searchParams.get("payment")?.split(",") || [];
    const open = searchParams.get("open") === "true";

    setSelectedGenres(genres);
    setSelectedAreas(areas);
    setSelectedPayments(payments);
    setShowOnlyOpen(open);

    // ✅ searchParamsが存在する場合は検索をトリガー
    const hasParams =
      genres.length > 0 || areas.length > 0 || payments.length > 0 || open;

    const cached = sessionStorage.getItem("searchCache");
    if (!hasParams && cached) {
      // 🔄 キャッシュ復元（リロード時）
      setIsSearchTriggered(true);
    } else if (hasParams) {
      setIsSearchTriggered(true);
    }
  }, [searchParams]);


  // 🔥 検索ボタン押したとき
  const handleSearch = () => {
    // 1. フィルターをsessionStorageに保存
    sessionStorage.setItem("filterGenres", JSON.stringify(selectedGenres));
    sessionStorage.setItem("filterAreas", JSON.stringify(selectedAreas));
    sessionStorage.setItem("filterPayments", JSON.stringify(selectedPayments));
    sessionStorage.setItem("filterOpen", JSON.stringify(showOnlyOpen));

    // 2. 通常の検索実行
    setIsSearchTriggered(false);
    setTimeout(() => {
      setIsSearchTriggered(true);
    }, 100);

    // 3. URLクエリパラメータ更新
    const params = new URLSearchParams();
    if (selectedGenres.length > 0) params.set("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.set("area", selectedAreas.join(","));
    if (selectedPayments.length > 0) params.set("payment", selectedPayments.join(","));
    if (showOnlyOpen) params.set("open", "true");

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-[#F7F5EF] mt-[48px] text-gray-800 pb-0 flex justify-center">
      <div className="w-full max-w-[1400px]">
        <div id="search-filter">
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
          />
        </div>

        {isSearchTriggered && (
          <SearchResults
            selectedGenres={selectedGenres}
            selectedAreas={selectedAreas}
            selectedPayments={selectedPayments}
            showOnlyOpen={showOnlyOpen}
            isSearchTriggered={isSearchTriggered}
          />
        )}
      </div>
    </div>
  );
}