"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SearchFilter from "@/components/SearchFilter";
import AboutSection from "@/components/AboutSection";
import RecommendedStores from "@/components/RecommendedStores";
import { motion } from "framer-motion";
import type { Messages } from "@/types/messages";

type HomeProps = {
  messages: Messages;
  locale: string;
};

export default function Home({ messages, locale }: HomeProps) {
  const router = useRouter();

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);
  const [previewCount, setPreviewCount] = useState<number>(0);

  useEffect(() => {
    const fetchPreviewCount = async () => {
      let query = supabase.from("stores").select("*").eq("is_published", true);
      if (selectedGenres.length > 0) query = query.in("genre_id", selectedGenres);
      if (selectedAreas.length > 0) query = query.in("area_id", selectedAreas);
      if (selectedPayments.length > 0) {
        query = query.overlaps("payment_method_ids", selectedPayments);
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

    router.push(`/${locale}/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-gray-800 pt-[70px]">
      <div className="text-center space-y-4">
        <motion.p
          className="text-xs font-light text-[#1F1F21] leading-none"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {messages.top.catchphrase}
        </motion.p>

        <motion.div
          className="relative w-[121px] h-[40px] mx-auto"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Image
            src="/header/logo.svg"
            alt={`${messages.top.title} ロゴ`}
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </div>

      <motion.div
        id="search-filter"
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
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
            areas: messages.areas,
          }}
        />
      </motion.div>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <RecommendedStores messages={messages.recommend} />
      </motion.div>

      <motion.div
        className="mt-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <AboutSection />
      </motion.div>
    </div>
  );
}