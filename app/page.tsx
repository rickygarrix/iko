"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchFilter from "@/components/SearchFilter";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";
import MapView from "@/components/MapView";
import AnimatedText from "@/components/AnimatedText";
import RecommendedStores from "@/components/RecommendedStores";

export default function Home() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false); // 🔹 地図表示の切り替え

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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <SearchFilter
        selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres}
        selectedAreas={selectedAreas} setSelectedAreas={setSelectedAreas}
        selectedPayments={selectedPayments} setSelectedPayments={setSelectedPayments}
        showOnlyOpen={showOnlyOpen} setShowOnlyOpen={setShowOnlyOpen}
        handleSearch={handleSearch}
      />
      <div className="mt-4 text-center">
        {/* 🔹 地図を表示するボタン */}
        <button
          onClick={() => setShowMap(!showMap)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showMap ? "リスト表示に戻る" : "📍 地図から探す"}
        </button>
      </div>

      {/* 🔹 地図の表示 */}
      {showMap ? (
        <GoogleMapsProvider>
          <MapView />
        </GoogleMapsProvider>
      ) : (
        <>
          <AnimatedText />
          <RecommendedStores />
        </>
      )}
    </div>
  );
}