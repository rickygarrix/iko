"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Store = {
  id: string;
  name: string;
  opening_hours: string;
  phone_number: string;
  address: string;
  website: string;
  instagram: string;
  alcohol: boolean;
  genre: string;
  entry_fee: string;
  capacity: number;
  regular_holiday: string;
  reservation: string;
};

export default function StoreDetail({ params }: { params: { id: string } }) {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!params.id) return;

    const fetchStore = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error fetching store:", error);
        return;
      }

      setStore(data);
      setLoading(false);
    };

    fetchStore();
  }, [params.id]);

  if (loading) return <p className="text-white p-4">ロード中...</p>;
  if (!store) return <p className="text-white p-4">店舗が見つかりません。</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <button onClick={() => router.back()} className="mb-4 text-blue-400">
        ← 戻る
      </button>
      <h1 className="text-3xl font-bold">{store.name}</h1>
      <p className="text-lg text-gray-400">{store.genre} / {store.capacity}人</p>
      <p className="mt-2">📍 住所: {store.address}</p>
      <p>🕒 営業時間: {store.opening_hours}</p>
      <p>📞 電話番号: {store.phone_number}</p>
      <p>🍸 アルコール提供: {store.alcohol ? "あり" : "なし"}</p>
      <p>💰 入場料: {store.entry_fee}</p>
      <p>🛑 定休日: {store.regular_holiday}</p>
      <p>📅 予約: {store.reservation}</p>

      <div className="mt-4">
        {store.website && (
          <a href={store.website} target="_blank" rel="noopener noreferrer" className="text-blue-400">
            🌐 公式サイト
          </a>
        )}
        {store.instagram && (
          <a href={store.instagram} target="_blank" rel="noopener noreferrer" className="ml-4 text-pink-400">
            📷 Instagram
          </a>
        )}
      </div>
    </div>
  );
}