"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Store = {
  id: string;
  name: string;
  genre: string;
  capacity: number;
};

export default function Home() {
  const router = useRouter();
  const [recommendedStores, setRecommendedStores] = useState<Store[]>([]);

  // 🔥 Supabaseからおすすめのクラブ取得
  useEffect(() => {
    const fetchRecommendedStores = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, genre, capacity")
        .limit(4);

      if (error) {
        console.error("🔥 Supabase Error:", error);
      } else {
        setRecommendedStores(data || []);
      }
    };

    fetchRecommendedStores();
  }, []);

  // 🔍 検索フィルター
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);

  // ✅ チェックボックス変更処理（選択時に枠の色を変える）
  const handleCheckboxChange = (value: string, setState: (values: string[]) => void, state: string[]) => {
    if (state.includes(value)) {
      setState(state.filter((item) => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  // 🔍 検索処理
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedGenres.length > 0) params.append("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.append("area", selectedAreas.join(","));
    if (selectedPayments.length > 0) params.append("payment", selectedPayments.join(","));
    if (selectedCapacities.length > 0) params.append("capacity", selectedCapacities.join(","));
    if (selectedHours.length > 0) params.append("hours", selectedHours.join(","));

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">オトナビ</h1>

      {/* 🔍 検索フィルター */}
      <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">検索フィルター</h2>

        {/* ジャンル */}
        <h3 className="text-lg font-semibold mt-4">ジャンル</h3>
        <div className="flex gap-4">
          {["House", "Jazz", "Techno"].map((genre) => (
            <label key={genre} className={`p-2 border rounded cursor-pointer ${selectedGenres.includes(genre) ? "bg-blue-500" : "border-gray-500"}`}>
              <input type="checkbox" value={genre} checked={selectedGenres.includes(genre)}
                onChange={() => handleCheckboxChange(genre, setSelectedGenres, selectedGenres)} className="hidden" />
              {genre}
            </label>
          ))}
        </div>

        {/* エリア */}
        <h3 className="text-lg font-semibold mt-4">エリア</h3>
        <div className="flex gap-4">
          {["新宿", "渋谷", "六本木", "池袋", "銀座", "表参道"].map((area) => (
            <label key={area} className={`p-2 border rounded cursor-pointer ${selectedAreas.includes(area) ? "bg-blue-500" : "border-gray-500"}`}>
              <input type="checkbox" value={area} checked={selectedAreas.includes(area)}
                onChange={() => handleCheckboxChange(area, setSelectedAreas, selectedAreas)} className="hidden" />
              {area}
            </label>
          ))}
        </div>

        {/* 支払い方法 */}
        <h3 className="text-lg font-semibold mt-4">支払い方法</h3>
        <div className="flex gap-4">
          {["現金", "クレジットカード", "交通系IC"].map((method) => (
            <label key={method} className={`p-2 border rounded cursor-pointer ${selectedPayments.includes(method) ? "bg-blue-500" : "border-gray-500"}`}>
              <input type="checkbox" value={method} checked={selectedPayments.includes(method)}
                onChange={() => handleCheckboxChange(method, setSelectedPayments, selectedPayments)} className="hidden" />
              {method}
            </label>
          ))}
        </div>

        {/* 🔍 検索ボタン */}
        <button onClick={handleSearch} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">検索</button>
      </div>

      {/* ✅ おすすめのクラブ */}
      <h2 className="text-2xl font-semibold mb-4">おすすめのクラブ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedStores.map((store) => (
          <Link key={store.id} href={`/stores/${store.id}`} passHref>
            <div className="p-4 bg-gray-800 rounded shadow cursor-pointer hover:bg-gray-700 transition">
              <h3 className="text-lg font-semibold">{store.name}</h3>
              <p className="text-gray-400">{store.genre} / {store.capacity}人</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}