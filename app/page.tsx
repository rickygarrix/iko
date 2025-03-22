"use client";

import { useState } from "react";
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
    <div className="min-h-screen bg-[#FAFAF5] text-gray-800 px-4 md:px-6 py-6 space-y-12">
      {/* 検索フィルター */}
      <div id="search-filter">
        <SearchFilter
          selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres}
          selectedAreas={selectedAreas} setSelectedAreas={setSelectedAreas}
          selectedPayments={selectedPayments} setSelectedPayments={setSelectedPayments}
          showOnlyOpen={showOnlyOpen} setShowOnlyOpen={setShowOnlyOpen}
          handleSearch={handleSearch}
        />
      </div>

      {/* 今月のおすすめ */}
      <RecommendedStores />

      {/* オトナビとは */}
      <AboutSection />
    </div>
  );
}