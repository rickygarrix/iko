"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { GENRES } from "@/constants/genres";
import { AREAS } from "@/constants/areas";
import { PAYMENTS } from "@/constants/payments";
import { useSearchParams } from "next/navigation";
import { logAction } from "@/lib/utils";
import type { Messages } from "@/types/messages";

type SearchFilterProps = {
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
}: SearchFilterProps) {
  const searchParams = useSearchParams();

  const logSearchAction = async (action: "search" | "reset_search") => {
    const currentParams = new URLSearchParams(window.location.search).toString();

    const payload: any = {
      query_params: currentParams,
    };

    if (action === "search") {
      payload.search_conditions = {
        genres: selectedGenres,
        areas: selectedAreas,
        payments: selectedPayments,
        openOnly: showOnlyOpen,
      };
      payload.result_count = previewCount;
    }

    await logAction(action, payload);
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

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }}
          className="space-y-8"
        >
          {/* 営業時間 */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
          >
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
          </motion.div>

          {/* ジャンル */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[16px] font-bold leading-[24px] mb-2">{messages.genre}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {GENRES.map((genre) => (
                <label
                  key={genre.key}
                  className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                >
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre.key)}
                    onChange={() =>
                      setSelectedGenres(
                        selectedGenres.includes(genre.key)
                          ? selectedGenres.filter((g) => g !== genre.key)
                          : [...selectedGenres, genre.key]
                      )
                    }
                    className="appearance-none w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21] bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] bg-check-icon bg-center bg-no-repeat"
                  />
                  {messages.genres[genre.key]}
                </label>
              ))}
            </div>
          </motion.div>

          {/* エリア */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[16px] font-bold leading-[24px] mb-2">
              {messages.area}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {AREAS.map((area) => (
                <label
                  key={area.key}
                  className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                >
                  <input
                    type="checkbox"
                    checked={selectedAreas.includes(area.key)}
                    onChange={() =>
                      setSelectedAreas(
                        selectedAreas.includes(area.key)
                          ? selectedAreas.filter((a) => a !== area.key)
                          : [...selectedAreas, area.key]
                      )
                    }
                    className="appearance-none w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21] bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] bg-check-icon bg-center bg-no-repeat"
                  />
                  {messages.areas[area.key]}
                </label>
              ))}
            </div>
          </motion.div>

          {/* 支払い方法 */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[16px] font-bold leading-[24px] mb-2">{messages.payment}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {PAYMENTS.map((payment) => (
                <label
                  key={payment.key}
                  className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                >
                  <input
                    type="checkbox"
                    checked={selectedPayments.includes(payment.key)}
                    onChange={() =>
                      setSelectedPayments(
                        selectedPayments.includes(payment.key)
                          ? selectedPayments.filter((p) => p !== payment.key)
                          : [...selectedPayments, payment.key]
                      )
                    }
                    className="appearance-none w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21] bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] bg-check-icon bg-center bg-no-repeat"
                  />
                  {messages.payments[payment.key]}
                </label>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ボタン */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex justify-center gap-4 mt-12"
        >
          {/* リセット */}
          <button
            onClick={async () => {
              await logSearchAction("reset_search");
              setSelectedGenres([]);
              setSelectedAreas([]);
              setSelectedPayments([]);
              setShowOnlyOpen(false);
            }}
            className="w-[100px] h-[48px] rounded-[8px] border border-[#1F1F21] bg-white text-[#1F1F21]
            text-[14px] font-normal hover:scale-105 active:scale-95 transition-transform"
          >
            {messages.reset}
          </button>

          {/* 検索 */}
          <button
            onClick={async (e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "auto" });
              await logSearchAction("search");
              handleSearch();
            }}
            className="w-[270px] h-[48px] bg-[#1F1F21] text-[#FEFCF6] rounded-[8px] border border-[#1F1F21]
            px-4 flex items-center justify-center gap-2 text-[14px] font-normal hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="relative w-[14px] h-[14px]">
              <Image
                src="/icons/search.svg"
                alt="検索アイコン"
                fill
                className="object-contain"
              />
            </div>
            {messages.search}（{previewCount}件）
          </button>
        </motion.div>
      </div>
    </div>
  );
}