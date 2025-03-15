"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import SearchFilter from "@/components/SearchFilter";
import AnimatedText from "@/components/AnimatedText";
import RecommendedStores from "@/components/RecommendedStores";
import Script from "next/script";

// ✅ 地図コンポーネントを非同期で読み込み（SSR無効化）
const MapView = dynamic(() => import("./components/MapView"), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);

  // ✅ 環境変数の取得（クライアントサイドで処理）
  useEffect(() => {
    setGoogleMapsApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "");
  }, []);

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
      {/* ✅ Google Maps APIのスクリプトをグローバルで一度だけ読み込む */}
      {googleMapsApiKey && (
        <Script
          strategy="beforeInteractive"
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`}
        />
      )}

      <SearchFilter
        selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres}
        selectedAreas={selectedAreas} setSelectedAreas={setSelectedAreas}
        selectedPayments={selectedPayments} setSelectedPayments={setSelectedPayments}
        showOnlyOpen={showOnlyOpen} setShowOnlyOpen={setShowOnlyOpen}
        handleSearch={handleSearch}
      />

      <div className="mt-4 text-center">
        <button
          onClick={() => setShowMap(!showMap)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showMap ? "リスト表示に戻る" : "📍 地図から探す"}
        </button>
      </div>

      {/* ✅ 地図とリストの表示切り替え */}
      {showMap ? <MapView /> : <><AnimatedText /><RecommendedStores /></>}
    </div>
  );
}