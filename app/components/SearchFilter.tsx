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
    <div className="mb-6 p-4 bg-gray-800 rounded">
      <h2 className="text-lg font-semibold mb-2">検索フィルター</h2>

      {/* 🔹 営業中のみ */}
      <label className="mt-4 block">
        <input
          type="checkbox"
          checked={showOnlyOpen}
          onChange={() => setShowOnlyOpen(!showOnlyOpen)}
          className="mr-2"
        />
        営業中のみ表示
      </label>

      {/* 🔹 ジャンル */}
      <div className="mt-4">
        <p className="font-semibold mb-2">ジャンル</p>
        {GENRES.map((genre) => (
          <label key={genre} className="mr-4">
            <input
              type="checkbox"
              className="mr-2"
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

      {/* 🔹 エリア */}
      <div className="mt-4">
        <p className="font-semibold mb-2">エリア</p>
        {AREAS.map((area) => (
          <label key={area} className="mr-4">
            <input
              type="checkbox"
              className="mr-2"
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

      {/* 🔹 支払い方法 */}
      <div className="mt-4">
        <p className="font-semibold mb-2">支払い方法</p>
        {PAYMENTS.map((payment) => (
          <label key={payment} className="mr-4">
            <input
              type="checkbox"
              className="mr-2"
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

      {/* 🔹 検索ボタン */}
      <button
        onClick={(event) => {
          event.preventDefault();
          handleSearch();
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        検索
      </button>

      {/* 🔹 リセットボタン */}
      <button
        onClick={() => {
          setSelectedGenres([]);
          setSelectedAreas([]);
          setSelectedPayments([]);
          setShowOnlyOpen(false);
        }}
        className="bg-gray-500 text-white px-4 py-2 rounded mt-4 ml-4"
      >
        リセット
      </button>
    </div>
  );
}