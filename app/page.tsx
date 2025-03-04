"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  // 検索条件の state（複数選択用）
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [recommendedStores, setRecommendedStores] = useState<
    { id: string; name: string; address: string; genre: string; capacity: number }[]
  >([]);

  // Supabase からおすすめの店舗を取得
  useEffect(() => {
    const fetchRecommendedStores = async () => {
      const { data, error } = await supabase.from("stores").select("*").limit(5);
      if (error) {
        console.error("🔥 Supabase Error:", error);
      } else {
        setRecommendedStores(data || []);
      }
    };

    fetchRecommendedStores();
  }, []);

  // チェックボックスの変更処理
  const handleCheckboxChange = (
    value: string,
    setState: React.Dispatch<React.SetStateAction<string[]>>,
    state: string[]
  ) => {
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
    if (selectedHours.length > 0) params.append("hours", selectedHours.join(","));
    if (selectedPayments.length > 0) params.append("payments", selectedPayments.join(","));

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

      {/* 営業時間フィルター */}
      <h2 className="text-lg font-semibold mb-2">営業時間</h2>
      <div className="mb-4">
        {["24時まで", "1時まで", "朝まで"].map((hour) => (
          <label key={hour} className="mr-4">
            <input
              type="checkbox"
              value={hour}
              checked={selectedHours.includes(hour)}
              onChange={() => handleCheckboxChange(hour, setSelectedHours, selectedHours)}
              className="mr-2"
            />
            {hour}
          </label>
        ))}
      </div>

      {/* 支払い方法フィルター */}
      <h2 className="text-lg font-semibold mb-2">支払い方法</h2>
      <div className="mb-4">
        {["現金", "クレジットカード", "交通系IC"].map((payment) => (
          <label key={payment} className="mr-4">
            <input
              type="checkbox"
              value={payment}
              checked={selectedPayments.includes(payment)}
              onChange={() => handleCheckboxChange(payment, setSelectedPayments, selectedPayments)}
              className="mr-2"
            />
            {payment}
          </label>
        ))}
      </div>

      {/* 検索ボタン */}
      <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
        検索
      </button>

      {/* おすすめの店舗リスト */}
      <h2 className="text-lg font-semibold mt-8">おすすめの店舗</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {recommendedStores.map((store) => (
          <div key={store.id} className="p-4 bg-gray-800 rounded shadow">
            <h3 className="text-xl font-semibold">{store.name}</h3>
            <p className="text-gray-400">{store.genre} / {store.capacity}人</p>
            <p className="text-gray-300">{store.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
}