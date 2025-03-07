"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

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

// 検索フィルターの選択肢
const GENRES = ["House", "Jazz", "Techno"];
const AREAS = ["新宿", "渋谷", "六本木", "池袋", "銀座", "表参道"];
const HOURS = ["24時まで", "1時まで", "朝まで"];
const PAYMENTS = ["現金", "クレジットカード", "交通系IC"];

export default function SearchResults() {
  return (
    <Suspense fallback={<p className="text-gray-400 mt-6">ロード中...</p>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 検索フィルターの状態管理
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  useEffect(() => {
    const genres = searchParams.get("genre")?.split(",") || [];
    const areas = searchParams.get("area")?.split(",") || [];
    const hours = searchParams.get("hours")?.split(",") || [];
    const payments = searchParams.get("payment")?.split(",") || [];

    setSelectedGenres(genres);
    setSelectedAreas(areas);
    setSelectedHours(hours);
    setSelectedPayments(payments);
  }, [searchParams]);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);

      let query = supabase.from("stores").select("*");

      if (selectedGenres.length > 0) query = query.in("genre", selectedGenres);
      if (selectedAreas.length > 0) query = query.in("area", selectedAreas);
      if (selectedHours.length > 0) query = query.in("opening_hours", selectedHours);
      if (selectedPayments.length > 0) query = query.overlaps("payment_methods", selectedPayments);

      const { data, error } = await query;

      if (error) {
        console.error("🔥 Supabase Error:", error.message);
        setError(error.message);
        setStores([]);
      } else {
        setStores(data || []);
      }

      setLoading(false);
    };

    fetchStores();
  }, [selectedGenres, selectedAreas, selectedHours, selectedPayments]);

  const handleCheckboxChange = (
    value: string,
    setState: React.Dispatch<React.SetStateAction<string[]>>,
    state: string[]
  ) => {
    setState(state.includes(value) ? state.filter((item) => item !== value) : [...state, value]);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedGenres.length > 0) params.append("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.append("area", selectedAreas.join(","));
    if (selectedHours.length > 0) params.append("hours", selectedHours.join(","));
    if (selectedPayments.length > 0) params.append("payment", selectedPayments.join(","));

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* 🔹カオナビのアイコンをクリックでホームに戻る */}
      <Link href="/" passHref>
        <h1 className="text-4xl font-bold cursor-pointer hover:text-blue-400 transition">オトナビ</h1>
      </Link>

      {/* 🔥 エラーがある場合に表示 */}
      {error && <p className="text-red-400 mt-4">エラーが発生しました: {error}</p>}

      {/* 🔍検索フィルター */}
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

      {/* 🔍検索結果の表示 */}
      {loading ? (
        <p className="mt-6">ロード中...</p>
      ) : stores.length === 0 ? (
        <p className="text-gray-400 mt-6">該当する店舗がありません。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {stores.map((store) => (
            <Link key={store.id} href={`/stores/${store.id}`} passHref>
              <div className="p-4 bg-gray-800 rounded shadow cursor-pointer hover:bg-gray-700 transition">
                <h2 className="text-xl font-semibold">{store.name}</h2>
                <p className="text-gray-400">{store.genre} / {store.capacity}人</p>
                <p className="text-gray-300">{store.address}</p>
                <p className="text-gray-300">営業時間: {store.opening_hours}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}