"use client";
import React from "react";

const GENRES = ["House", "Jazz", "Techno", "EDM"];
const AREAS = ["新宿", "渋谷", "六本木", "池袋", "銀座", "表参道"];
const PAYMENTS = ["現金", "クレジットカード", "電子マネー", "コード決済"];

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
    <div className="w-full flex justify-center bg-[#F7F5EF] pt-[48px] pb-8">
      <div className="w-full max-w-[600px] px-6 text-[#1F1F21] text-[14px] leading-[20px] font-normal space-y-6">
        <div className="text-center">
          <h2 className="text-[18px] font-bold leading-[26px] mb-1">条件検索</h2>
          <p className="text-sm text-[#4B5C9E]">Search</p>
        </div>

        {/* 営業時間 */}
        <div>
          <p className="text-[16px] font-bold leading-[24px] mb-2">営業時間</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <label className="relative flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="openingHours"
                checked={!showOnlyOpen}
                onChange={() => setShowOnlyOpen(false)}
                className="peer appearance-none w-[20px] h-[20px] border border-[#1F1F21] rounded-full
                bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] relative"
              />
              <span
                className="pointer-events-none absolute left-[6px] top-[6px] w-[8px] h-[8px] rounded-full
                bg-white peer-checked:block hidden"
              ></span>
              営業時間外も含む
            </label>

            <label className="relative flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="openingHours"
                checked={showOnlyOpen}
                onChange={() => setShowOnlyOpen(true)}
                className="peer appearance-none w-[20px] h-[20px] border border-[#1F1F21] rounded-full
                bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] relative"
              />
              <span
                className="pointer-events-none absolute left-[6px] top-[6px] w-[8px] h-[8px] rounded-full
                bg-white peer-checked:block hidden"
              ></span>
              営業時間内のみ
            </label>
          </div>
        </div>

        {/* ジャンル */}
        <div>
          <p className="text-[16px] font-bold leading-[24px] mb-2">ジャンル</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {GENRES.map((genre) => (
              <label key={genre} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="appearance-none check-icon w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21]
                  bg-[#FFFFFF] checked:bg-[#4B5C9E] checked:border-[#1F1F21]
                  checked:bg-check-icon bg-center bg-no-repeat"
                  checked={selectedGenres.includes(genre)}
                  onChange={() =>
                    setSelectedGenres(
                      selectedGenres.includes(genre)
                        ? selectedGenres.filter((g) => g !== genre)
                        : [...selectedGenres, genre]
                    )
                  }
                />
                {genre}
              </label>
            ))}
          </div>
        </div>

        {/* エリア */}
        <div>
          <p className="text-[16px] font-bold leading-[24px] mb-2">エリア</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {AREAS.map((area) => (
              <label key={area} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="appearance-none check-icon w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21]
                  bg-[#FFFFFF] checked:bg-[#4B5C9E] checked:border-[#1F1F21]
                  checked:bg-check-icon bg-center bg-no-repeat"
                  checked={selectedAreas.includes(area)}
                  onChange={() =>
                    setSelectedAreas(
                      selectedAreas.includes(area)
                        ? selectedAreas.filter((a) => a !== area)
                        : [...selectedAreas, area]
                    )
                  }
                />
                {area}
              </label>
            ))}
          </div>
        </div>

        {/* 支払い */}
        <div>
          <p className="text-[16px] font-bold leading-[24px] mb-2">支払い</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {PAYMENTS.map((payment) => (
              <label key={payment} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="appearance-none check-icon w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21]
                  bg-[#FFFFFF] checked:bg-[#4B5C9E] checked:border-[#1F1F21]
                  checked:bg-check-icon bg-center bg-no-repeat"
                  checked={selectedPayments.includes(payment)}
                  onChange={() =>
                    setSelectedPayments(
                      selectedPayments.includes(payment)
                        ? selectedPayments.filter((p) => p !== payment)
                        : [...selectedPayments, payment]
                    )
                  }
                />
                {payment}
              </label>
            ))}
          </div>
        </div>

        {/* ボタン */}
        <div className="flex justify-center mt-4 gap-4">
          <button
            onClick={() => {
              setSelectedGenres([]);
              setSelectedAreas([]);
              setSelectedPayments([]);
              setShowOnlyOpen(false);
            }}
            className="w-[100px] h-[48px] rounded-[8px] border border-[#1F1F21] bg-white text-[#1F1F21]
            text-[14px] font-normal hover:bg-gray-100 transition"
          >
            リセット
          </button>

          <button
            onClick={(event) => {
              event.preventDefault();
              handleSearch();
            }}
            className="w-[270px] h-[48px] bg-[#1F1F21] text-[#FEFCF6] rounded-[8px] border border-[#1F1F21]
            px-4 flex items-center justify-center gap-2 text-[14px] font-normal"
          >
            <img
              src="/icons/search.svg"
              alt="検索アイコン"
              className="w-[14px] h-[14px]"
            />
            検索（{previewCount}件）
          </button>
        </div>
      </div>
    </div>
  );
}