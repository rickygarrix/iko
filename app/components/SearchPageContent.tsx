"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchFilter from "@/components/SearchFilter";
import SearchResults from "@/components/SearchResults";
import { supabase } from "@/lib/supabase";
import { checkIfOpen } from "@/lib/utils";

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);
  const [isSearchTriggered, setIsSearchTriggered] = useState<boolean>(false);
  const [previewCount, setPreviewCount] = useState<number>(0);

  // 🔁 初期化 & 検索条件があればトリガー
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

  // プレビュー件数の取得
  useEffect(() => {
    const fetchPreviewCount = async () => {
      let query = supabase.from("stores").select("*");

      if (selectedGenres.length > 0) query = query.in("genre", selectedGenres);
      if (selectedAreas.length > 0) query = query.in("area", selectedAreas);
      if (selectedPayments.length > 0)
        query = query.overlaps("payment_methods", selectedPayments);

      const { data, error } = await query;
      if (!error && data) {
        let filtered = data;
        if (showOnlyOpen) {
          filtered = filtered.filter((store) =>
            checkIfOpen(store.opening_hours).isOpen
          );
        }
        setPreviewCount(filtered.length);
      }
    };

    fetchPreviewCount();
  }, [selectedGenres, selectedAreas, selectedPayments, showOnlyOpen]);

  const handleSearch = () => {
    setIsSearchTriggered(false);
    setTimeout(() => setIsSearchTriggered(true), 100);

    const params = new URLSearchParams();
    if (selectedGenres.length > 0) params.set("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.set("area", selectedAreas.join(","));
    if (selectedPayments.length > 0)
      params.set("payment", selectedPayments.join(","));
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
            previewCount={previewCount}
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