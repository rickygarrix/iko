"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

// 店舗の型（discription → description に修正）
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
  description: string;
  access: string;
  map?: string;
};

export default function StoreDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  const previousPage = searchParams.get("prev") || "";
  const queryParams = searchParams.toString();

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

    const savedCenter = sessionStorage.getItem("mapCenter");
    if (savedCenter) {
      const parsedCenter = JSON.parse(savedCenter);
      setMapCenter(parsedCenter);
      sessionStorage.setItem("mapCenter", JSON.stringify(parsedCenter));
    }
  }, [id]);

  if (loading) return <p className="text-center text-gray-600">ロード中...</p>;
  if (!store) return <p className="text-center text-red-500">店舗が見つかりませんでした。</p>;

  const handleBack = () => {
    if (previousPage === "/map") {
      if (mapCenter) {
        sessionStorage.setItem("mapCenter", JSON.stringify(mapCenter));
      }
      router.push(`/map?${queryParams}`);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5] text-gray-800 p-6">
      {/* 戻るボタン */}
      <button
        onClick={handleBack}
        className="text-sm text-blue-500 underline mb-4 hover:text-blue-700"
      >
        ← 戻る
      </button>

      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        {/* 店舗画像 */}
        {store.image_url && (
          <Image
            src={store.image_url}
            alt={store.name}
            width={800}
            height={400}
            className="w-full h-64 object-cover"
          />
        )}

        <div className="p-6">
          {/* 店舗名・紹介文 */}
          <h1 className="text-2xl font-bold mb-1">{store.name}</h1>
          <p className="text-sm text-gray-600 mb-4">{store.description}</p>

          {/* ジャンル・キャパ・営業時間・エリアなど */}
          <div className="mb-4 space-y-1 text-sm">
            <p><strong>ジャンル:</strong> {store.genre}</p>
            <p><strong>エリア:</strong> {store.address}</p>
            <p><strong>キャパシティ:</strong> {store.capacity}人</p>
            <p><strong>入場料:</strong> {store.entry_fee}</p>
            <p><strong>営業時間:</strong><br />
              <span className="whitespace-pre-wrap">{store.opening_hours}</span>
            </p>
            <p><strong>定休日:</strong> {store.regular_holiday || "なし"}</p>
            <p><strong>電話番号:</strong> {store.phone}</p>
            <p><strong>アクセス:</strong> {store.access}</p>
          </div>

          {/* 支払い方法 */}
          <div className="mb-6">
            <p className="font-semibold mb-2">■ 支払い方法</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              {store.payment_methods.map((method, index) => (
                <span key={index}>○ {method}</span>
              ))}
            </div>
          </div>

          {/* ボタンエリア */}
          <div className="space-y-2">
            {store.map && (
              <a
                href={store.map}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
              >
                Googleマップで開く
              </a>
            )}
            {store.website && (
              <a
                href={store.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-black text-white py-2 rounded hover:bg-gray-800"
              >
                公式サイト →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}