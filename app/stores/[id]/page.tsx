"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Store = {
  id: string;
  name: string;
  address: string;
  genre: string;
  capacity: number;
  opening_hours: string;
  regular_holiday: string;
  phone_number: string;
  reservation: string;
  entry_fee: string;
  website?: string | null;
  instagram?: string | null;
};

export default function StoreDetail() {
  const { id } = useParams();
  const router = useRouter(); // 🔥 ホームに戻る機能を追加！
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase Error:", error);
      } else {
        setStore(data);
      }
      setLoading(false);
    };

    if (id) fetchStore();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!store) return <p>店舗が見つかりません。</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* 🔥 「オトナビ」を押すとホームに戻る */}
      <h1 className="text-3xl font-bold mb-6 cursor-pointer" onClick={() => router.push("/")}>
        オトナビ
      </h1>

      <h2 className="text-2xl font-bold">{store.name}</h2>
      <p className="mt-4 text-gray-300">{store.address}</p>
      <p className="text-gray-400">{store.genre} / {store.capacity}人</p>
      <p className="text-gray-300">営業時間: {store.opening_hours}</p>
      <p className="text-gray-300">定休日: {store.regular_holiday}</p>
      <p className="text-gray-300">電話番号: {store.phone_number}</p>
      <p className="text-gray-300">予約: {store.reservation}</p>
      <p className="text-gray-300">入場料: {store.entry_fee}</p>

      {store.website && (
        <p className="mt-4">
          <a
            href={store.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            公式サイト
          </a>
        </p>
      )}

      {store.instagram && (
        <p className="mt-2">
          <a
            href={store.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 hover:underline"
          >
            Instagram
          </a>
        </p>
      )}
    </div>
  );
}