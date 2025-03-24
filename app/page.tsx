"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SearchFilter from "@/components/SearchFilter";
import AboutSection from "@/components/AboutSection";
import RecommendedStores from "@/components/RecommendedStores";


export default function Home() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);



  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedGenres.length > 0) params.append("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.append("area", selectedAreas.join(","));
    if (selectedPayments.length > 0) params.append("payment", selectedPayments.join(","));
    if (showOnlyOpen) params.append("open", "true");

    if (params.toString() === "") {
      params.set("all", "true");
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-gray-800 pt-6 ">

      {/* 🔹 ヘッダー的キャッチコピー */}
      <div className="text-center space-y-1">
        <p className="text-sm text-[#1F1F21] leading-relaxed">今夜の音を見つけよう</p>
        <div className="relative w-[121px] h-[40px] mx-auto">
          <Image
            src="header/logo.svg"
            alt="オトナビ ロゴ"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* 🔍 検索フィルター */}
      <div id="search-filter">
        <SearchFilter
          selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres}
          selectedAreas={selectedAreas} setSelectedAreas={setSelectedAreas}
          selectedPayments={selectedPayments} setSelectedPayments={setSelectedPayments}
          showOnlyOpen={showOnlyOpen} setShowOnlyOpen={setShowOnlyOpen}
          handleSearch={handleSearch}
        />
      </div>

      {/* 🌟 今月のおすすめ */}
      <div className="overflow-hidden">
        <RecommendedStores />
      </div>

      {/* ℹ️ オトナビとは */}
      <div className="px-0">
        <AboutSection />
      </div>
    </div>
  );
}