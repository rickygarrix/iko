"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// 店舗のデータ型を定義
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
  area: string;
  payment_methods: string | string[] | null; // 🔥 修正済み（配列・文字列・nullを考慮）
  website?: string | null;
  instagram?: string | null;
};

export default function StoreDetail() {
  const { id } = useParams();
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
        console.error("🔥 Supabase Error:", error);
      } else {
        setStore(data);
      }
      setLoading(false);
    };

    if (id) fetchStore();
  }, [id]);

  if (loading) return <p className="text-white">Loading...</p>;
  if (!store) return <p className="text-red-500">店舗が見つかりません。</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* 🔥 オトナビロゴ（クリックでホームへ） */}
      <Link href="/" passHref>
        <h1 className="text-4xl font-bold cursor-pointer transition">
          オトナビ
        </h1>
      </Link>

      <h2 className="text-3xl font-bold">{store.name}</h2>
      <p className="mt-4 text-gray-300">{store.address}</p>
      <p className="text-gray-400">{store.genre} / {store.capacity}人</p>
      <p className="text-gray-300">営業時間: {store.opening_hours}</p>
      <p className="text-gray-300">定休日: {store.regular_holiday}</p>
      <p className="text-gray-300">電話番号: {store.phone_number}</p>
      <p className="text-gray-300">予約: {store.reservation}</p>
      <p className="text-gray-300">入場料: {store.entry_fee}</p>
      <p className="text-gray-300">エリア: {store.area}</p>

      {/* 🔥 支払い方法（配列対応） */}
      <p className="text-gray-300">
        支払い方法:{" "}
        {Array.isArray(store.payment_methods)
          ? store.payment_methods.join(", ")
          : store.payment_methods || "情報なし"}
      </p>

      {/* 🔥 公式サイト / Instagram */}
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