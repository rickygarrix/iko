"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

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
  map: string | null;
  image_url: string | null;
  website: string | null;
  facilities: string[] | null;
  entry_fee: number | null;
};

export default function StoreDetail() {
  const params = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    const fetchStore = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", params.id as string)
        .single();

      if (error) {
        console.error("🔥 Supabase Error:", error.message);
        setError(error.message);
      } else {
        setStore(data);
      }

      setLoading(false);
    };

    fetchStore();
  }, [params.id]);

  if (loading) return <p className="text-center text-white">ロード中...</p>;
  if (!store) return <p className="text-center text-white">店舗が見つかりませんでした。</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      {/* 🔥 オトナビのロゴを左寄せ */}
      <Link href="/" passHref>
        <h1 className="text-4xl font-bold text-left w-full max-w-4xl">オトナビ</h1>
      </Link>

      {/* 店舗情報のコンテナ */}
      <div className="w-full max-w-4xl mt-6 bg-gray-800 p-6 rounded-lg shadow-lg flex">
        {/* 左側の情報部分 */}
        <div className="w-2/3 pr-4">
          <h2 className="text-3xl font-bold">{store.name}</h2>
          <p className="text-gray-400 text-lg mt-2">🎵 ジャンル: {store.genre}</p>
          <p className="text-gray-300 mt-2">💰 料金: {store.entry_fee !== null ? `${store.entry_fee}円` : "情報なし"}</p>
          <p className="text-gray-300">⏰ 営業時間: {store.opening_hours || "情報なし"}</p>
          <p className="text-gray-300">
            💳 支払い方法:{" "}
            {store.payment_methods && store.payment_methods.length > 0
              ? store.payment_methods.join(", ")
              : "情報なし"}
          </p>

          {/* Googleマップボタン (幅を小さく) */}
          {store.map && (
            <div className="mt-4">
              <a
                href={store.map}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 text-white px-4 py-2 rounded-md block text-center hover:bg-gray-600 w-1/3"
              >
                Googleマップで開く
              </a>
            </div>
          )}
        </div>

        {/* 右側の店舗画像 */}
        {store.image_url && (
          <div className="w-1/3">
            <img
              src={store.image_url}
              alt={store.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* 設備・ルール */}
      <div className="w-full max-w-4xl mt-6">
        <h3 className="text-xl font-semibold">🛠️ 設備・ルール</h3>
        <div className="bg-gray-700 p-4 rounded-lg mt-2">
          {store.facilities && store.facilities.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2">
              {store.facilities.map((facility, index) => (
                <li key={index} className="text-gray-300 bg-gray-800 p-2 rounded-md">
                  {facility}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">Coming soon</p>
          )}
        </div>
      </div>

      {/* 公式サイト */}
      {store.website && (
        <div className="mt-6 text-center">
          <a
            href={store.website}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600 transition block text-center w-full"
          >
            公式サイト →
          </a>
        </div>
      )}
    </div>
  );
}