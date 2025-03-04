"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  // フィルターの state
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [recommendedStores, setRecommendedStores] = useState<
    { id: string; name: string; genre: string; capacity: number; area: string; opening_hours: string }[]
  >([]);

  useEffect(() => {
    const fetchRecommendedStores = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, genre, capacity, area, opening_hours")
        .order("id", { ascending: true });

      if (error) {
        console.error("🔥 Supabase Error:", error.message);
      } else {
        setRecommendedStores(data || []);
      }
    };

    fetchRecommendedStores();
  }, []);

  // チェックボックスの変更処理
  const handleCheckboxChange = (value: string, setState: Function, state: string[]) => {
    setState(state.includes(value) ? state.filter((item) => item !== value) : [...state, value]);
  };

  // 検索ボタンが押されたとき
  const handleSearch = () => {
    const params = new URLSearchParams();

    // もしどのチェックボックスも選択されていなければ、全データを表示
    if (selectedGenres.length > 0) params.append("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.append("area", selectedAreas.join(","));
    if (selectedCapacities.length > 0) params.append("capacity", selectedCapacities.join(","));
    if (selectedHours.length > 0) params.append("hours", selectedHours.join(","));
    if (selectedPayments.length > 0) params.append("payment", selectedPayments.join(","));

    // 何も選択されていない場合は全店舗を表示
    if (
      selectedGenres.length === 0 &&
      selectedAreas.length === 0 &&
      selectedCapacities.length === 0 &&
      selectedHours.length === 0 &&
      selectedPayments.length === 0
    ) {
      router.push(`/search`);
    } else {
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">オトナビ</h1>

      {/* 🔍 検索フィルター */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">検索フィルター</h2>

        {/* 🎵 ジャンル */}
        <h3 className="text-lg font-medium mb-2">ジャンル</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {["House", "Jazz", "Techno"].map((genre) => (
            <label key={genre} className="flex items-center gap-2">
              <input type="checkbox" checked={selectedGenres.includes(genre)} onChange={() => handleCheckboxChange(genre, setSelectedGenres, selectedGenres)} />
              {genre}
            </label>
          ))}
        </div>

        {/* 📍 エリア */}
        <h3 className="text-lg font-medium mb-2">エリア</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {["新宿", "渋谷", "六本木", "池袋", "銀座", "表参道"].map((area) => (
            <label key={area} className="flex items-center gap-2">
              <input type="checkbox" checked={selectedAreas.includes(area)} onChange={() => handleCheckboxChange(area, setSelectedAreas, selectedAreas)} />
              {area}
            </label>
          ))}
        </div>

        {/* 👥 キャパシティ */}
        <h3 className="text-lg font-medium mb-2">キャパシティ</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {["50人以下", "100人以下", "200人以下"].map((cap) => (
            <label key={cap} className="flex items-center gap-2">
              <input type="checkbox" checked={selectedCapacities.includes(cap)} onChange={() => handleCheckboxChange(cap, setSelectedCapacities, selectedCapacities)} />
              {cap}
            </label>
          ))}
        </div>

        {/* 🕰 営業時間 */}
        <h3 className="text-lg font-medium mb-2">営業時間</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {["24時まで", "1時まで", "朝まで"].map((hour) => (
            <label key={hour} className="flex items-center gap-2">
              <input type="checkbox" checked={selectedHours.includes(hour)} onChange={() => handleCheckboxChange(hour, setSelectedHours, selectedHours)} />
              {hour}
            </label>
          ))}
        </div>

        {/* 💳 支払い方法 */}
        <h3 className="text-lg font-medium mb-2">支払い方法</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {["現金", "クレジットカード", "交通系IC"].map((payment) => (
            <label key={payment} className="flex items-center gap-2">
              <input type="checkbox" checked={selectedPayments.includes(payment)} onChange={() => handleCheckboxChange(payment, setSelectedPayments, selectedPayments)} />
              {payment}
            </label>
          ))}
        </div>

        {/* 🔎 検索ボタン */}
        <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600">
          検索
        </button>
      </div>

      {/* ⭐ おすすめのクラブ */}
      <h2 className="text-xl font-semibold mt-8 mb-4">おすすめのクラブ</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendedStores.map((store) => (
          <Link key={store.id} href={`/stores/${store.id}`} passHref>
            <div className="p-4 bg-gray-800 rounded shadow cursor-pointer hover:bg-gray-700 transition">
              <h2 className="text-xl font-semibold">{store.name}</h2>
              <p className="text-gray-400">{store.genre} / {store.capacity}人</p>
              <p className="text-gray-300">エリア: {store.area}</p>
              <p className="text-gray-300">営業時間: {store.opening_hours}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}