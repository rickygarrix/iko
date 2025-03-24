"use client";
import React from "react";
import { FaSearch } from "react-icons/fa";

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
    <div className=" p-6 bg-[#F7F5EF] rounded-md shadow-sm max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-1 text-gray-800 tracking-wide">
        条件検索
      </h2>
      <p className="text-sm text-center text-[#4B5C9E] mb-2">Search</p>

      {/* 🔹 営業中のみ */}
      <div className="mb-4">
        <p className="font-semibold mb-2 text-gray-800">営業時間</p>
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
      </div>

      {/* 🔹 ジャンル */}
      <div className="mb-4">
        <p className="font-semibold mb-2 text-gray-800">ジャンル</p>
        <div className="grid grid-cols-2 gap-2">
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
        <div className="grid grid-cols-2 gap-2">
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
        <div className="grid grid-cols-2 gap-2">
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


      <div className="flex justify-center mt-6 gap-4">
        {/* リセットボタン */}
        <button
          onClick={() => {
            setSelectedGenres([]);
            setSelectedAreas([]);
            setSelectedPayments([]);
            setShowOnlyOpen(false);
          }}
          className="bg-white text-black border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100 transition text-sm w-24"
        >
          リセット
        </button>

        {/* 検索ボタン（大きめサイズ） */}
        <button
          onClick={(event) => {
            event.preventDefault();
            handleSearch();
          }}
          className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm w-56"
        >
          <FaSearch className="text-base" />
          検索
        </button>
      </div>
    </div>
  );
}