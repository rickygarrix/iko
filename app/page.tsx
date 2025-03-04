"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  // 検索条件の state（複数選択用）
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]); // ✅ キャパシティ削除

  // チェックボックスの変更処理（型は明示）
  const handleCheckboxChange = (
    value: string,
    setState: React.Dispatch<React.SetStateAction<string[]>>,
    state: string[]
  ): void => {
    if (state.includes(value)) {
      setState(state.filter((item) => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  // 検索ボタンが押されたとき
  const handleSearch = (): void => {
    const params = new URLSearchParams();

    if (selectedGenres.length > 0) params.append("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.append("area", selectedAreas.join(",")); // ✅ キャパシティ削除

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* ホームに戻る機能付き「オトナビ」 */}
      <h1 className="text-3xl font-bold mb-6">
        <Link href="/" className="no-underline hover:no-underline">オトナビ</Link>
      </h1>

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
        {["新宿", "渋谷", "表参道", "銀座", "池袋", "六本木"].map((area) => (
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

      {/* 検索ボタン */}
      <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
        検索
      </button>
    </div>
  );
}