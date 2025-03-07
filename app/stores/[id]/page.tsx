"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// 店舗データの型
type Store = {
  id: string;
  name: string;
  address: string;
  genre: string;
  price: string;
  opening_hours: string;
  payment_methods: string[];
  facilities: string[];
  map: string;
  image_url: string;
  website: string | null;
};

export default function StoreDetail() {
  const params = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      if (!params.id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", params.id)
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="text-3xl font-bold">オトナビ</Link>
      </div>

      {/* 店舗画像 */}
      {store.image_url && (
        <img src={store.image_url} alt={store.name} className="w-full h-64 object-cover rounded-lg mb-4" />
      )}

      {/* 店舗情報 */}
      <h1 className="text-3xl font-bold">{store.name}</h1>
      <p className="text-gray-400">{store.genre}</p>
      <p className="text-gray-400">💰 料金: {store.price}</p>
      <p className="text-gray-400">⏰ 営業時間: {store.opening_hours}</p>

      {/* Googleマップ埋め込み */}
      {store.map && (
        <div className="mt-4">
          <iframe
            src={store.map}
            width="100%"
            height="300"
            style={{ border: "0" }}
            allowFullScreen
            loading="lazy"
            className="rounded-lg"
          />
          <a
            href={store.map}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-gray-800 text-white py-2 mt-2 rounded-lg"
          >
            Googleマップで開く
          </a>
        </div>
      )}

          <h2 className="text-xl font-semibold mt-6">⚙️ 設備・ルール</h2>
          <div className="grid grid-cols-2 gap-2 bg-gray-800 p-4 rounded-lg">
           {store.facilities?.length > 0 ? (
             store.facilities.map((facility, index) => (
              <p key={index} className="text-gray-300">{facility}</p>
              ))
             ) : (
              <p className="text-gray-400">情報なし</p>
            )}
          </div>

      {/* 支払い方法 */}
      <h2 className="text-xl font-semibold mt-6">💳 支払い方法</h2>
      <div className="grid grid-cols-2 gap-2 bg-gray-800 p-4 rounded-lg">
        {store.payment_methods.length > 0 ? (
          store.payment_methods.map((method, index) => (
            <p key={index} className="text-gray-300">{method}</p>
          ))
        ) : (
          <p className="text-gray-400">情報なし</p>
        )}
      </div>

      {/* 公式サイト (スクロール固定) */}
      {store.website && (
        <div className="fixed bottom-4 left-0 w-full flex justify-center">
          <a
            href={store.website}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600 transition"
          >
            公式サイト →
          </a>
        </div>
      )}
    </div>
  );
}