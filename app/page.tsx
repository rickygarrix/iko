"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // 検索条件の state（複数選択用）
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<string[]>([]);

  // チェックボックスの変更処理
  const handleCheckboxChange = (value: string, setState: Function, state: string[]) => {
    if (state.includes(value)) {
      setState(state.filter((item) => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  // 検索ボタンが押されたとき
  const handleSearch = () => {
    const params = new URLSearchParams();

    if (selectedGenres.length > 0) params.append("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.append("area", selectedAreas.join(","));
    if (selectedCapacities.length > 0) params.append("capacity", selectedCapacities.join(","));

    // `/search` に検索条件を付与して遷移
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">オトナビ</h1>

      {/* ジャンルフィルター */}
      <h2 className="text-lg font-semibold mb-2">ジャンル</h2>
      <div className="mb-4">
        {["House", "Jazz", "Techno"].map((genre) => (
          <label key={genre} className="mr-4">
            <input
              type="checkbox"
              value={genre}
              checked={selectedGenres.includes(genre)}
              onChange={() => handleCheckboxChange(genre, setSelectedGenres, selectedGenres)}
              className="mr-2"
            />
            {genre}
          </label>
        ))}
      </div>

      {/* エリアフィルター */}
      <h2 className="text-lg font-semibold mb-2">エリア</h2>
      <div className="mb-4">
        {["東京", "大阪", "福岡"].map((area) => (
          <label key={area} className="mr-4">
            <input
              type="checkbox"
              value={area}
              checked={selectedAreas.includes(area)}
              onChange={() => handleCheckboxChange(area, setSelectedAreas, selectedAreas)}
              className="mr-2"
            />
            {area}
          </label>
        ))}
      </div>

      {/* キャパシティフィルター */}
      <h2 className="text-lg font-semibold mb-2">キャパシティ</h2>
      <div className="mb-4">
        {["50", "100", "200"].map((cap) => (
          <label key={cap} className="mr-4">
            <input
              type="checkbox"
              value={cap}
              checked={selectedCapacities.includes(cap)}
              onChange={() => handleCheckboxChange(cap, setSelectedCapacities, selectedCapacities)}
              className="mr-2"
            />
            {cap}人以下
          </label>
        ))}
      </div>

      {/* 検索ボタン */}
      <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
        検索
      </button>
    </div>
  );
}