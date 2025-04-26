"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { logAction } from "@/lib/utils";
import type { Messages } from "@/types/messages";

type Option = { id: string; name: string };

type Props = {
  selectedGenres: string[];
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAreas: string[];
  setSelectedAreas: React.Dispatch<React.SetStateAction<string[]>>;
  selectedPayments: string[];
  setSelectedPayments: React.Dispatch<React.SetStateAction<string[]>>;
  showOnlyOpen: boolean;
  setShowOnlyOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSearch: () => void;
  previewCount: number;
  showTitle?: boolean;
  messages: Messages["searchFilter"] & {
    payments: { [key: string]: string };
    genres: { [key: string]: string };
    areas: { [key: string]: string };
  };
};

export default function SearchFilter({
  selectedGenres,
  setSelectedGenres,
  selectedAreas,
  setSelectedAreas,
  selectedPayments,
  setSelectedPayments,
  showOnlyOpen,
  setShowOnlyOpen,
  handleSearch,
  previewCount,
  showTitle = true,
  messages,
}: Props) {

  const [genres, setGenres] = useState<Option[]>([]);
  const [areas, setAreas] = useState<Option[]>([]);
  const [, setPayments] = useState<Option[]>([]);

  // ✅ locale を pathname から抽出（useParams()はクライアントで使いづらいため）
  const locale = typeof window !== "undefined"
    ? window.location.pathname.split("/")[1] || "ja"
    : "ja";

  useEffect(() => {
    const fetch = async () => {
      const [{ data: genreData }, { data: areaData }, { data: paymentData }] = await Promise.all([
        supabase.from("genre_translations").select("genre_id, name").eq("locale", locale),
        supabase.from("area_translations").select("area_id, name").eq("locale", locale),
        supabase.from("payment_method_translations").select("payment_method_id, name").eq("locale", locale),
      ]);

      setGenres(genreData?.map((g) => ({ id: g.genre_id, name: g.name })) ?? []);

      setGenres(
        (genreData?.map((g) => ({ id: g.genre_id, name: g.name })) ?? []).filter(
          (g) => g.id !== "other"
        )
      );
      // 並び順を固定する
      const areaOrder = [
        "shibuya",
        "shinjuku",
        "roppongi",
        "ginza",
        "ikebukuro",
        "omotesando",
        "ueno",
        "yokohama",
      ];

      setAreas(
        (areaData?.map((a) => ({ id: a.area_id, name: a.name })) ?? []).sort(
          (a, b) => areaOrder.indexOf(a.id) - areaOrder.indexOf(b.id)
        )
      );

      const genreOrder = [
        "house",
        "techno",
        "edm",
        "hiphop",
        "pops",
        "jazz",
      ];

      setGenres(
        (genreData?.map((g) => ({ id: g.genre_id, name: g.name })) ?? [])
          .filter((g) => g.id !== "other")
          .sort((a, b) => genreOrder.indexOf(a.id) - genreOrder.indexOf(b.id))
      );



      setPayments(
        (paymentData?.map((p) => ({ id: p.payment_method_id, name: p.name })) ?? []).filter(
          (p) => p.id !== "other"
        )
      );
    };

    fetch();
  }, [locale]);

  const logSearchAction = async (action: "search" | "reset_search") => {
    await logAction(action, {
      locale,
      search_conditions: {
        genres: selectedGenres,
        areas: selectedAreas,
        payments: selectedPayments,
        openOnly: showOnlyOpen,
      },
    });
  };

  return (
    <div className="w-full flex justify-center bg-[#F7F5EF] pt-[48px] pb-12">
      <div className="w-full max-w-[600px] px-6 text-[#1F1F21] text-[14px] font-normal space-y-10">
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-[18px] font-bold leading-[26px] mb-1">{messages.title}</h2>
            <p className="text-sm text-[#4B5C9E]">{messages.search}</p>
          </motion.div>
        )}

        {/* 条件項目一覧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* 営業時間 */}
          <div>
            <p className="text-[16px] font-bold leading-[24px] mb-2">{messages.open}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[{ label: messages.open_all, value: false }, { label: messages.open_now, value: true }].map(({ label, value }) => (
                <label key={label} className="relative flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
                  <input
                    type="radio"
                    name="openingHours"
                    checked={showOnlyOpen === value}
                    onChange={() => setShowOnlyOpen(value)}
                    className="peer appearance-none w-[20px] h-[20px] border border-[#1F1F21] rounded-full bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] relative"
                  />
                  <span className="pointer-events-none absolute left-[6px] top-[6px] w-[8px] h-[8px] rounded-full bg-white hidden peer-checked:block" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* ジャンル */}
          <div>
            <p className="text-[16px] font-bold leading-[24px] mb-2">{messages.genre}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {genres.map((genre) => (
                <label key={genre.id} className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre.id)}
                    onChange={() =>
                      setSelectedGenres(
                        selectedGenres.includes(genre.id)
                          ? selectedGenres.filter((g) => g !== genre.id)
                          : [...selectedGenres, genre.id]
                      )
                    }
                    className="appearance-none w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21] bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] bg-[url('/icons/check.svg')] bg-center bg-no-repeat"
                  />
                  {genre.name}
                </label>
              ))}
            </div>
          </div>

          {/* エリア */}
          <div>
            <p className="text-[16px] font-bold leading-[24px] mb-2">{messages.area}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {areas.map((area) => (
                <label key={area.id} className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
                  <input
                    type="checkbox"
                    checked={selectedAreas.includes(area.id)}
                    onChange={() =>
                      setSelectedAreas(
                        selectedAreas.includes(area.id)
                          ? selectedAreas.filter((a) => a !== area.id)
                          : [...selectedAreas, area.id]
                      )
                    }
                    className="appearance-none w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21] bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] bg-[url('/icons/check.svg')] bg-center bg-no-repeat"
                  />
                  {area.name}
                </label>
              ))}
            </div>
          </div>

          {/*
  支払い方法フィルター（Ver1では未使用、将来用）
  <div>
    <p className="text-[16px] font-bold leading-[24px] mb-2">{messages.payment}</p>
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      {payments.map((payment) => (
        <label key={payment.id} className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
          <input
            type="checkbox"
            checked={selectedPayments.includes(payment.id)}
            onChange={() =>
              setSelectedPayments(
                selectedPayments.includes(payment.id)
                  ? selectedPayments.filter((p) => p !== payment.id)
                  : [...selectedPayments, payment.id]
              )
            }
            className="appearance-none w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21] bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] bg-[url('/icons/check.svg')] bg-center bg-no-repeat"
          />
          {payment.name}
        </label>
      ))}
    </div>
  </div>
*/}
        </motion.div>

        {/* 検索ボタン */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex justify-center gap-4 mt-12"
        >
          <button
            onClick={async () => {
              await logSearchAction("reset_search");
              setSelectedGenres([]);
              setSelectedAreas([]);
              setSelectedPayments([]);
              setShowOnlyOpen(false);
            }}
            className="w-[100px] h-[48px] rounded-[8px] border border-[#1F1F21] bg-white text-[#1F1F21] text-[14px] font-normal hover:scale-105 active:scale-95 transition-transform"
          >
            {messages.reset}
          </button>

          <button
            onClick={async (e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "auto" });
              await logSearchAction("search");
              handleSearch();
            }}
            className="w-[270px] h-[48px] bg-[#1F1F21] text-[#FEFCF6] rounded-[8px] border border-[#1F1F21] px-4 flex items-center justify-center gap-2 text-[14px] font-normal hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="relative w-[14px] h-[14px]">
              <Image src="/icons/search.svg" alt="検索アイコン" fill className="object-contain" />
            </div>
            {messages.search}（{previewCount}{messages.items}）
          </button>
        </motion.div>
      </div>
    </div>
  );
}