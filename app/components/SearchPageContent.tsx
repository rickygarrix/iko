"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchFilter from "@/components/SearchFilter";
import SearchResults from "@/components/SearchResults";
import { supabase } from "@/lib/supabase";
import { checkIfOpen } from "@/lib/utils"; // これ追加！！
import useSWR from "swr";

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);
  const [isSearchTriggered, setIsSearchTriggered] = useState<boolean>(false);

  // 🔥 プレビュー件数取得（営業中フィルターも対応）
  const fetchPreviewCount = async (
    selectedGenres: string[],
    selectedAreas: string[],
    selectedPayments: string[],
    showOnlyOpen: boolean
  ): Promise<number> => {
    let query = supabase.from("stores").select("*"); // ✨ 全件取得！

    if (selectedGenres.length > 0) query = query.in("genre", selectedGenres);
    if (selectedAreas.length > 0) query = query.in("area", selectedAreas);
    if (selectedPayments.length > 0) query = query.overlaps("payment_methods", selectedPayments);

    const { data, error } = await query;

    if (error || !data) {
      console.error("🔥 Supabase Error:", error?.message);
      return 0;
    }

    // ✨ 営業中フィルター（クライアント側判定）
    const filtered = showOnlyOpen
      ? data.filter((store) => checkIfOpen(store.opening_hours).isOpen)
      : data;

    return filtered.length;
  };

  const { data: previewCount } = useSWR(
    ["previewCount", selectedGenres, selectedAreas, selectedPayments, showOnlyOpen],
    ([, selectedGenres, selectedAreas, selectedPayments, showOnlyOpen]) =>
      fetchPreviewCount(selectedGenres, selectedAreas, selectedPayments, showOnlyOpen),
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

    setIsSearchTriggered(true);
  }, [searchParams]);

  // 🔥 検索ボタン押したとき
  const handleSearch = () => {
    sessionStorage.setItem("filterGenres", JSON.stringify(selectedGenres));
    sessionStorage.setItem("filterAreas", JSON.stringify(selectedAreas));
    sessionStorage.setItem("filterPayments", JSON.stringify(selectedPayments));
    sessionStorage.setItem("filterOpen", JSON.stringify(showOnlyOpen));

    setIsSearchTriggered(false);
    setTimeout(() => {
      setIsSearchTriggered(true);
    }, 100);

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