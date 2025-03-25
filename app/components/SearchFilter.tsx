"use client";
import React from "react";

const GENRES = ["House", "Jazz", "Techno", "EDM"];
const AREAS = ["新宿", "渋谷", "六本木", "池袋", "銀座", "表参道"];
const PAYMENTS = ["現金", "クレジットカード", "電子マネー", "コード決済", "その他"];

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
};

export default function SearchFilter({
  selectedGenres, setSelectedGenres,
  selectedAreas, setSelectedAreas,
  selectedPayments, setSelectedPayments,
  showOnlyOpen, setShowOnlyOpen,
  handleSearch
}: SearchFilterProps) {
  return (
    <div className=" p-6 px-4 bg-[#F7F5EF] rounded-md shadow-sm max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-1 text-gray-800 tracking-wide">
        条件検索
      </h2>
      <p className="text-sm text-center text-[#4B5C9E] mb-2">Search</p>

      {/* 営業時間 */}
      <div>
        <p className="text-[16px] font-bold leading-[24px] mb-2">営業時間</p>
        <div className="flex gap-4">
          {/* 営業時間内のみ */}
          <label className="inline-flex items-center relative cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyOpen}
              onChange={() => setShowOnlyOpen(!showOnlyOpen)}
              className="peer appearance-none w-[20px] h-[20px] border border-[#1F1F21] rounded-full mr-2
                  checked:border-[#1F1F21] checked:bg-[#4B5C9E] relative"
            />
            <span className="absolute left-[6px] top-[8px] w-[8px] h-[8px] rounded-full bg-[#FEFCF6] peer-checked:block hidden"></span>
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
                           bg-[#FEFCF6] checked:bg-[#4B5C9E] checked:border-[#1F1F21]
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
                           bg-[#FEFCF6] checked:bg-[#4B5C9E] checked:border-[#1F1F21]
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

      {/* 支払い方法 */}
      <div>
        <p className="text-[16px] font-bold leading-[24px] mb-2">支払い</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {PAYMENTS.map((payment) => (
            <label key={payment} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="appearance-none check-icon w-[20px] h-[20px] rounded-[4px] border border-[#1F1F21]
                           bg-[#FEFCF6] checked:bg-[#4B5C9E] checked:border-[#1F1F21]
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
          検索
        </button>
      </div>
    </div>
  );
}