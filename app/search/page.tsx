"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilter from "@/components/SearchFilter";
import SearchResults from "@/components/SearchResults"; // ✅ `SearchResults.tsx` をインポート

export default function Search() {
  const searchParams = useSearchParams();

  // 🔹 検索フィルターの状態管理
  const [selectedGenres, setSelectedGenres] = useState<string[]>(searchParams.get("genre")?.split(",") || []);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(searchParams.get("area")?.split(",") || []);
  const [selectedPayments, setSelectedPayments] = useState<string[]>(searchParams.get("payment")?.split(",") || []);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(searchParams.get("open") === "true");

  // 🔹 `handleSearch` を追加
  const handleSearch = () => {
    console.log("🔍 検索を実行");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      {/* 🔹 検索フィルター */}
      <SearchFilter
        selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres}
        selectedAreas={selectedAreas} setSelectedAreas={setSelectedAreas}
        selectedPayments={selectedPayments} setSelectedPayments={setSelectedPayments}
        showOnlyOpen={showOnlyOpen} setShowOnlyOpen={setShowOnlyOpen}
        handleSearch={handleSearch} // ✅ `handleSearch` を渡す
      />

      {/* 🔹 検索結果を表示 */}
      <SearchResults
        selectedGenres={selectedGenres}
        selectedAreas={selectedAreas}
        selectedPayments={selectedPayments}
        showOnlyOpen={showOnlyOpen}
      />
    </div>
  );
}