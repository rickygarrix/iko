"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";

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
  discription: string; // ✅ 追加: 店の説明
  access: string; // ✅ 追加: 最寄駅からの行き方
  map?: string;
};

export default function StoreDetail() {
  const { id } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      {/* 🔹 店舗情報エリア */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col md:flex-row gap-6">
        {/* 画像とリンクを縦に配置 */}
        <div className="flex flex-col items-center space-y-4">
          {/* 🔹 店舗画像 */}
          {store.image_url && (
            <img
              src={store.image_url}
              alt={store.name}
              className="w-80 h-80 object-cover rounded-lg"
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
        <div className="w-1/2 pl-6">
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <p className="text-gray-400">🎵 ジャンル: {store.genre}</p>
          <p className="text-gray-400">👥 {store.capacity}人</p>
          <p className="text-gray-400">📍 {store.address}</p>
          <p className="text-gray-400">📞 {store.phone}</p>

          {/* ✅ 追加: 店舗の説明 */}
          <p className="mt-2 text-gray-300">🏠 店舗の説明:</p>
          <p className="text-gray-400">{store.discription}</p>

          {/* ✅ 追加: 最寄駅からの行き方 */}
          <p className="mt-2 text-gray-300">🚉 アクセス:</p>
          <p className="text-gray-400">{store.access}</p>

          {/* 休みの欄 */}
          <p className="text-gray-400">🚫 休み: {store.regular_holiday || "なし"}</p>

          {/* 営業時間 */}
          <p className="mt-2 text-gray-300">⏰ 営業時間:</p>
          <pre className="text-gray-400 whitespace-pre-wrap">{store.opening_hours}</pre>

          {/* 支払い方法 */}
          <p className="mt-2 text-gray-400">
            💳 支払い方法: {store.payment_methods.join(", ")}
          </p>

          {/* Instagramリンク */}
          {store.instagram && (
            <p className="mt-2">
              📷 <a href={store.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Instagram</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}