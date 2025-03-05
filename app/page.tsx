"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// 店舗データの型
type Store = {
  id: string;
  name: string;
  address: string;
  genre: string;
  capacity: number;
  area: string;
  opening_hours: string;
  payment_methods: string[] | null;
};

// フィルター用の型
type FilterState = string[];

// 検索フィルターの選択肢
const GENRES = ["House", "Jazz", "Techno"];
const AREAS = ["新宿", "渋谷", "六本木", "池袋", "銀座", "表参道"];
const HOURS = ["24時まで", "1時まで", "朝まで"];
const PAYMENTS = ["現金", "クレジットカード", "交通系IC"];

export default function Home() {
  const router = useRouter();

  // フィルターの状態管理
  const [selectedGenres, setSelectedGenres] = useState<FilterState>([]);
  const [selectedAreas, setSelectedAreas] = useState<FilterState>([]);
  const [selectedHours, setSelectedHours] = useState<FilterState>([]);
  const [selectedPayments, setSelectedPayments] = useState<FilterState>([]);

  // おすすめクラブの状態管理
  const [recommendedStores, setRecommendedStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Supabase からおすすめのクラブを取得
  useEffect(() => {
    const fetchRecommendedStores = async (): Promise<void> => {
      setLoading(true);
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .order("capacity", { ascending: false }) // 収容人数が多い順で取得
        .limit(6); // 6件まで表示

      if (error) {
        console.error("🔥 Supabase Error:", error.message);
        setError(error.message);
        setRecommendedStores([]);
      } else {
        setRecommendedStores(data || []);
      }

      setLoading(false);
    };

    fetchRecommendedStores();
  }, []);

  // チェックボックスの変更処理
  const handleCheckboxChange = (
    value: string,
    setState: React.Dispatch<React.SetStateAction<FilterState>>,
    state: FilterState
  ) => {
    setState(state.includes(value) ? state.filter((item) => item !== value) : [...state, value]);
  };

  // 検索ボタンを押したときに検索結果画面に遷移
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedGenres.length) params.append("genre", selectedGenres.join(","));
    if (selectedAreas.length) params.append("area", selectedAreas.join(","));
    if (selectedHours.length) params.append("hours", selectedHours.join(","));
    if (selectedPayments.length) params.append("payment", selectedPayments.join(","));

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">オトナビ</h1>

      {/* 🔥 エラーがある場合に表示 */}
      {error && <p className="text-red-400 mt-4">エラーが発生しました: {error}</p>}

      {/* 検索フィルター */}
      <div className="mb-6 p-4 bg-gray-800 rounded">
        <h2 className="text-lg font-semibold mb-2">検索フィルター</h2>

        {/* ジャンル */}
        <h3 className="text-md font-semibold mt-4">ジャンル</h3>
        {GENRES.map((genre) => (
          <label key={genre} className="mr-4">
            <input
              type="checkbox"
              checked={selectedGenres.includes(genre)}
              onChange={() => handleCheckboxChange(genre, setSelectedGenres, selectedGenres)}
              className="mr-2"
            />
            {genre}
          </label>
        ))}

        {/* エリア */}
        <h3 className="text-md font-semibold mt-4">エリア</h3>
        {AREAS.map((area) => (
          <label key={area} className="mr-4">
            <input
              type="checkbox"
              checked={selectedAreas.includes(area)}
              onChange={() => handleCheckboxChange(area, setSelectedAreas, selectedAreas)}
              className="mr-2"
            />
            {area}
          </label>
        ))}

        {/* 営業時間 */}
        <h3 className="text-md font-semibold mt-4">営業時間</h3>
        {HOURS.map((hour) => (
          <label key={hour} className="mr-4">
            <input
              type="checkbox"
              checked={selectedHours.includes(hour)}
              onChange={() => handleCheckboxChange(hour, setSelectedHours, selectedHours)}
              className="mr-2"
            />
            {hour}
          </label>
        ))}

        {/* 支払い方法 */}
        <h3 className="text-md font-semibold mt-4">支払い方法</h3>
        {PAYMENTS.map((payment) => (
          <label key={payment} className="mr-4">
            <input
              type="checkbox"
              checked={selectedPayments.includes(payment)}
              onChange={() => handleCheckboxChange(payment, setSelectedPayments, selectedPayments)}
              className="mr-2"
            />
            {payment}
          </label>
        ))}

        {/* 検索ボタン */}
        <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
          検索
        </button>
      </div>

      {/* おすすめのクラブ */}
      <h2 className="text-lg font-semibold mt-6">おすすめのクラブ</h2>

      {loading ? (
        <p className="mt-6">ロード中...</p>
      ) : recommendedStores.length === 0 ? (
        <p className="text-gray-400 mt-6">おすすめのクラブがありません。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {recommendedStores.map((store) => (
            <div
              key={store.id}
              className="p-4 bg-gray-800 rounded shadow cursor-pointer hover:bg-gray-700 transition"
              onClick={() => router.push(`/stores/${store.id}`)}
            >
              <h2 className="text-xl font-semibold">{store.name}</h2>
              <p className="text-gray-400">{store.genre} / {store.capacity}人</p>
              <p className="text-gray-300">エリア: {store.area}</p>
              <p className="text-gray-300">営業時間: {store.opening_hours}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}