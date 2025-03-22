"use client";
import React from "react";

const GENRES = ["House", "Jazz", "Techno", "EDM"];
const AREAS = ["新宿", "渋谷", "六本木", "池袋", "銀座", "表参道"];
const PAYMENTS = ["現金", "クレジットカード", "電子マネー"];

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
    <div className="mb-6 p-6 bg-[#FAFAF5] rounded-md shadow-sm border border-gray-200 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-1 text-gray-800 tracking-wide">
        条件検索
      </h2>
      <p className="text-sm text-center text-blue-500 mb-6">Search</p>

      {/* 🔹 営業中のみ */}
      <div className="mb-4">
        <label className="inline-flex items-center text-gray-700">
          <input
            type="checkbox"
            checked={showOnlyOpen}
            onChange={() => setShowOnlyOpen(!showOnlyOpen)}
            className="mr-2 w-4 h-4 accent-black"
          />
          営業中のみ表示
        </label>
      </div>

      {/* 🔹 ジャンル */}
      <div className="mb-4">
        <p className="font-semibold mb-2 text-gray-800">ジャンル</p>
        <div className="flex flex-wrap gap-3">
          {GENRES.map((genre) => (
            <label key={genre} className="inline-flex items-center text-gray-700">
              <input
                type="checkbox"
                className="mr-2 w-4 h-4 accent-black"
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

      {/* 🔹 エリア */}
      <div className="mb-4">
        <p className="font-semibold mb-2 text-gray-800">エリア</p>
        <div className="flex flex-wrap gap-3">
          {AREAS.map((area) => (
            <label key={area} className="inline-flex items-center text-gray-700">
              <input
                type="checkbox"
                className="mr-2 w-4 h-4 accent-black"
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

      {/* 🔹 支払い方法 */}
      <div className="mb-4">
        <p className="font-semibold mb-2 text-gray-800">支払い方法</p>
        <div className="flex flex-wrap gap-3">
          {PAYMENTS.map((payment) => (
            <label key={payment} className="inline-flex items-center text-gray-700">
              <input
                type="checkbox"
                className="mr-2 w-4 h-4 accent-black"
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

      {/* 🔹 ボタンエリア */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          onClick={(event) => {
            event.preventDefault();
            handleSearch();
          }}
          className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition"
        >
          🔍 検索
        </button>
        <button
          onClick={() => {
            setSelectedGenres([]);
            setSelectedAreas([]);
            setSelectedPayments([]);
            setShowOnlyOpen(false);
          }}
          className="bg-white text-black border border-gray-300 px-6 py-2 rounded-full hover:bg-gray-100 transition"
        >
          リセット
        </button>
      </div>
    </div>
  );
}