"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SearchFilter from "@/components/SearchFilter";
import AboutSection from "@/components/AboutSection";
import RecommendedStores from "@/components/RecommendedStores";
import type { Messages } from "@/types/messages";

type HomeProps = {
  messages: Messages;
};

export default function Home({ messages }: HomeProps) {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);
  const [previewCount, setPreviewCount] = useState<number>(0);

  useEffect(() => {
    const fetchPreviewCount = async () => {
      let query = supabase.from("stores").select("*").eq("is_published", true);
      if (selectedGenres.length > 0) query = query.in("genre", selectedGenres);
      if (selectedAreas.length > 0) query = query.in("area", selectedAreas);
      if (selectedPayments.length > 0) {
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
      <div className="text-center space-y-4">
        <p className="text-xs font-light text-[#1F1F21] leading-none">
          {messages.top.catchphrase}
        </p>
        <div className="relative w-[121px] h-[40px] mx-auto">
          <Image
            src="/header/logo.svg"
            alt={`${messages.top.title} ロゴ`}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

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
          showTitle={false}
          messages={{
            ...messages.searchFilter,
            genres: messages.genres,
            payments: messages.payments,
          }}
        />
      </div>

      <div className="mt-8">
        <RecommendedStores messages={messages.recommend} />
      </div>

      <div className="mt-0">
        <AboutSection />
      </div>
    </div>
  );
}