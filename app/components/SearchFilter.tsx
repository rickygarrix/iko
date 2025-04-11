
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { GENRES } from "@/constants/genres";
import { AREAS } from "@/constants/areas";
import { PAYMENTS } from "@/constants/payments";

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
};

export default function SearchFilter({
  selectedGenres, setSelectedGenres,
  selectedAreas, setSelectedAreas,
  selectedPayments, setSelectedPayments,
  showOnlyOpen, setShowOnlyOpen,
  handleSearch,
  previewCount,
}: SearchFilterProps) {
  return (
    <div className="w-full flex justify-center bg-[#F7F5EF] pt-[48px] pb-12">
      <div className="w-full max-w-[600px] px-6 text-[#1F1F21] text-[14px] font-normal space-y-10">

        {/* --- タイトル --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-[18px] font-bold leading-[26px] mb-1">条件検索</h2>
          <p className="text-sm text-[#4B5C9E]">Search</p>
        </motion.div>

        {/* --- フィルター --- */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.2 } },
          }}
          className="space-y-8"
        >
          {/* 営業時間 */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[16px] font-bold leading-[24px] mb-2">営業時間</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                { label: "営業時間外も含む", value: false },
                { label: "営業時間内のみ", value: true },
              ].map(({ label, value }) => (
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
            <p className="text-[16px] font-bold leading-[24px] mb-2">ジャンル</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {GENRES.map((genre) => (
                <label key={genre} className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre)}
                    onChange={() =>
                      setSelectedGenres(
                        selectedGenres.includes(genre)
                          ? selectedGenres.filter((g) => g !== genre)
                          : [...selectedGenres, genre]
                      )
                    }
                    className="appearance-none w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21] bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] bg-check-icon bg-center bg-no-repeat"
                  />
                  {genre}
                </label>
              ))}
            </div>
          </motion.div>

          {/* エリア */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[16px] font-bold leading-[24px] mb-2">エリア</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {AREAS.map((area) => (
                <label key={area} className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
                  <input
                    type="checkbox"
                    checked={selectedAreas.includes(area)}
                    onChange={() =>
                      setSelectedAreas(
                        selectedAreas.includes(area)
                          ? selectedAreas.filter((a) => a !== area)
                          : [...selectedAreas, area]
                      )
                    }
                    className="appearance-none w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21] bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] bg-check-icon bg-center bg-no-repeat"
                  />
                  {area}
                </label>
              ))}
            </div>
          </motion.div>

          {/* 支払い方法 */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[16px] font-bold leading-[24px] mb-2">支払い方法</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {PAYMENTS.map((payment) => (
                <label key={payment} className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
                  <input
                    type="checkbox"
                    checked={selectedPayments.includes(payment)}
                    onChange={() =>
                      setSelectedPayments(
                        selectedPayments.includes(payment)
                          ? selectedPayments.filter((p) => p !== payment)
                          : [...selectedPayments, payment]
                      )
                    }
                    className="appearance-none w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21] bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] bg-check-icon bg-center bg-no-repeat"
                  />
                  {payment}
                </label>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* --- ボタンエリア --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex justify-center gap-4 mt-12"
        >
          {/* リセット */}
          <button
            onClick={() => {
              setSelectedGenres([]);
              setSelectedAreas([]);
              setSelectedPayments([]);
              setShowOnlyOpen(false);
            }}
            className="w-[100px] h-[48px] rounded-[8px] border border-[#1F1F21] bg-white text-[#1F1F21]
            text-[14px] font-normal hover:scale-105 active:scale-95 transition-transform"
          >
            リセット
          </button>

          {/* 検索 */}
          <button
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "auto" });
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
            検索（{previewCount}件）
          </button>
        </motion.div>

      </div>
    </div>
  );
}