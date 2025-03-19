"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

type Store = {
  id: string;
  name: string;
  genre: string;
  entry_fee: string;
  opening_hours: string;
  regular_holiday: string;
  capacity: string;
  instagram?: string | null;
  payment_methods: string[];
  address: string;
  phone: string;
  website?: string;
  image_url?: string;
  discription: string;
  access: string;
  map?: string;
};

export default function StoreDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [locations, setLocations] = useState<Store[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  // 🔹 「前のページ」の情報を取得
  const previousPage = searchParams.get("prev") || "";
  const queryParams = searchParams.toString(); // すべてのクエリパラメータを保持

  useEffect(() => {
    const fetchStore = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("🔥 Supabase Error:", error.message);
        setStore(null);
      } else {
        setStore(data);
      }
      setLoading(false);
    };

    fetchStore();
  }, [id]);

  if (loading) return <p className="text-center text-white">ロード中...</p>;
  if (!store) return <p className="text-center text-white">店舗が見つかりませんでした。</p>;

  // ✅ `fetchNearbyStores` を `StoreDetail.tsx` に追加
  const fetchNearbyStores = async (
    lat: number,
    lng: number,
    filterOpen: boolean,
    genres: string[]
  ): Promise<Store[]> => {
    if (!lat || !lng) return [];

    const { data, error } = await supabase
      .from("stores")
      .select("id, name, latitude, longitude, genre, area, image_url, opening_hours, entry_fee, regular_holiday, capacity, payment_methods, address, phone, discription, access");

    if (error) {
      console.error("🔥 Supabase Error:", error.message);
      return [];
    }

    if (data) {
      return data.map((store) => ({
        id: store.id,
        name: store.name,
        lat: Number(store.latitude),
        lng: Number(store.longitude),
        genre: store.genre,
        area: store.area,
        image_url: store.image_url || "/default-image.jpg",
        opening_hours: store.opening_hours || "営業時間情報なし",
        isOpen: store.opening_hours ? true : false,
        displayText: "営業中",
        nextOpening: "不明",
        entry_fee: store.entry_fee || "不明",
        regular_holiday: store.regular_holiday || "なし",
        capacity: store.capacity || "不明",
        payment_methods: store.payment_methods || [],
        address: store.address || "未登録",
        phone: store.phone || "未登録",
        discription: store.discription || "説明なし",
        access: store.access || "アクセス情報なし",
      }));
    }

    return [];
  };

  const handleBack = () => {
    if (previousPage === "/map" || previousPage === "/search") {
      // 🔹 sessionStorage からデータを取得
      const savedCenter = sessionStorage.getItem("mapCenter");
      const savedZoom = sessionStorage.getItem("mapZoom");
      const savedFilters = sessionStorage.getItem("filters");
      const savedLocations = sessionStorage.getItem("locations");

      // 🔹 セッションストレージのデータを適用
      if (savedCenter) setMapCenter(JSON.parse(savedCenter));

      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        setShowOnlyOpen(filters.showOnlyOpen);
        setSelectedGenres(filters.selectedGenres);
      }

      if (savedLocations) {
        setLocations(JSON.parse(savedLocations));
      } else if (mapCenter) {
        fetchNearbyStores(mapCenter.lat, mapCenter.lng, showOnlyOpen, selectedGenres).then((results: Store[]) => {
          setLocations(results);
          sessionStorage.setItem("locations", JSON.stringify(results));
        });
      }

      router.push(`/map?${queryParams}`);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* 🔹 戻るボタン */}
      <button
        onClick={handleBack}
        className="bg-gray-700 text-white px-4 py-2 rounded-md mb-4 hover:bg-gray-600 transition"
      >
        ← 戻る
      </button>

      {/* 🔹 店舗情報エリア */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col md:flex-row gap-6">
        {/* 画像とリンクを縦に配置 */}
        <div className="flex flex-col items-center space-y-4">
          {/* 🔹 店舗画像 */}
          {store.image_url && (
            <Image
              src={store.image_url}
              alt={store.name}
              width={320}
              height={320}
              className="object-cover rounded-lg"
            />
          )}

          {/* 🔹 Googleマップリンク */}
          <a
            href={store.map}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full text-center hover:bg-gray-600 transition"
          >
            Googleマップで開く
          </a>

          {/* 🔹 公式サイトリンク */}
          {store.website && (
            <a
              href={store.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full text-center hover:bg-blue-400 transition"
            >
              公式サイト →
            </a>
          )}
        </div>

        {/* 🔹 店舗詳細 */}
        <div className="w-full sm:w-1/2">
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <p className="text-gray-400">🎵 ジャンル: {store.genre}</p>
          <p className="text-gray-400">👥 {store.capacity}人</p>
          <p className="text-gray-400">📍 {store.address}</p>
          <p className="text-gray-400">📞 {store.phone}</p>
          <p className="text-gray-400">🚫 休み: {store.regular_holiday || "なし"}</p>
          <p className="mt-2 text-gray-300">⏰ 営業時間:</p>
          <pre className="text-gray-400 whitespace-pre-wrap">{store.opening_hours}</pre>
        </div>
      </div>
    </div>
  );
}