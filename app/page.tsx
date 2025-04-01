"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SearchFilter from "@/components/SearchFilter";
import AboutSection from "@/components/AboutSection";
import RecommendedStores from "@/components/RecommendedStores";

export default function Home() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);
  const [previewCount, setPreviewCount] = useState<number>(0);

  // 🔄 フィルター変更時に件数を更新
  useEffect(() => {
    const fetchPreviewCount = async () => {
      let query = supabase.from("stores").select("*");

      if (selectedGenres.length > 0) {
        query = query.in("genre", selectedGenres);
      }

      if (selectedAreas.length > 0) {
        query = query.in("area", selectedAreas);
      }

      if (selectedPayments.length > 0) {
        // `or` 条件で支払い方法のいずれかにマッチ
        query = query.or(
          selectedPayments.map((p) => `payment_methods.cs.{${p}}`).join(",")
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("プレビュー件数の取得に失敗:", error.message);
        setPreviewCount(0);
      } else {
        const filtered = data || [];

        if (showOnlyOpen) {
          // 営業中フィルターを後でローカルに適用（DBに開閉状態はないため）
          const { checkIfOpen } = await import("@/lib/utils");
          const opened = filtered.filter((store) =>
            checkIfOpen(store.opening_hours).isOpen
          );
          setPreviewCount(opened.length);
        } else {
          setPreviewCount(filtered.length);
        }
      }
    };

    fetchPreviewCount();
  }, [selectedGenres, selectedAreas, selectedPayments, showOnlyOpen]);

  // 🔍 検索ボタン押下時の動作
  const handleSearch = () => {
    const params = new URLSearchParams();

    if (selectedGenres.length > 0) params.append("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.append("area", selectedAreas.join(","));
    if (selectedPayments.length > 0) params.append("payment", selectedPayments.join(","));
    if (showOnlyOpen) params.append("open", "true");
    if (params.toString() === "") params.set("all", "true");

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-gray-800 pt-[70px]">
      {/* 🔹 ファーストビュー */}
      <div className="text-center space-y-4">
        <p className="text-xs font-light text-[#1F1F21] leading-none">
          今夜の音を見つけよう
        </p>
        <div className="relative w-[121px] h-[40px] mx-auto">
          <Image
            src="/header/logo.svg"
            alt="オトナビ ロゴ"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* 🔍 検索フィルター */}
      <div id="search-filter" className="mt-6">
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

      {/* 🌟 今月のおすすめ */}
      <div className=" mt-8">
        <RecommendedStores />
      </div>

      {/* ℹ️ オトナビとは */}
      <div className="mt-0">
        <AboutSection />
      </div>
    </div>
  );
}