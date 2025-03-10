"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchFilter from "@/components/SearchFilter";
import SearchResults from "@/components/SearchResults";

export default function Search() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🔹 検索フィルターの状態管理
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);
  const [isSearchTriggered, setIsSearchTriggered] = useState<boolean>(false);

  // ✅ URLのパラメータを取得して初期状態をセット
  useEffect(() => {
    const genres = searchParams.get("genre")?.split(",") || [];
    const areas = searchParams.get("area")?.split(",") || [];
    const payments = searchParams.get("payment")?.split(",") || [];
    const open = searchParams.get("open") === "true";

    setSelectedGenres(genres);
    setSelectedAreas(areas);
    setSelectedPayments(payments);
    setShowOnlyOpen(open);

    // ✅ 検索パラメータが存在する場合は自動で検索
    if (searchParams.toString() !== "") {
      setIsSearchTriggered(true);
    }
  }, [searchParams]);

  // ✅ 検索ボタンが押された時に `isSearchTriggered` を `true` にする
  const handleSearch = () => {
    setIsSearchTriggered(false); // 🔹 一度 `false` にリセット
    setTimeout(() => setIsSearchTriggered(true), 100); // 🔹 `true` に戻す

    const params = new URLSearchParams();
    if (selectedGenres.length > 0) params.set("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.set("area", selectedAreas.join(","));
    if (selectedPayments.length > 0) params.set("payment", selectedPayments.join(","));
    if (showOnlyOpen) params.set("open", "true");

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <SearchFilter
        selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres}
        selectedAreas={selectedAreas} setSelectedAreas={setSelectedAreas}
        selectedPayments={selectedPayments} setSelectedPayments={setSelectedPayments}
        showOnlyOpen={showOnlyOpen} setShowOnlyOpen={setShowOnlyOpen}
        handleSearch={handleSearch}
      />

      {/* 🔹 `isSearchTriggered` が `true` の時のみ `SearchResults` を表示 */}
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
  );
}