"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Store = {
  id: string;
  name: string;
  genre: string;
  address: string;
  phone_number: string;
  opening_hours: string;
  regular_holiday: string;
  website: string;
  instagram: string;
  payment_methods: string[];
  description: string;
  image_url: string;
};

export default function StoreDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStore = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .single<Store>();

      if (error || !data) {
        console.error("取得エラー:", error);
        setError("データ取得に失敗しました");
      } else {
        setStore(data);
      }
      setLoading(false);
    };

    if (id) {
      fetchStore();
    }
  }, [id]);

  if (loading) return <div className="text-center p-10">読み込み中...</div>;
  if (error) return <div className="text-center text-red-500 p-10">{error}</div>;
  if (!store) return null;

  return (
    <div className="min-h-screen bg-[#FEFCF6] p-6 text-gray-800">
      <div className="max-w-2xl mx-auto bg-white shadow p-8 rounded space-y-6">
        <h1 className="text-2xl font-bold text-center">店舗詳細</h1>

        <DetailItem label="店名" value={store.name} />
        <DetailItem label="ジャンル" value={store.genre} />
        <DetailItem label="住所" value={store.address} />
        <DetailItem label="電話番号" value={store.phone_number} />
        <DetailItem label="営業時間" value={store.opening_hours} />
        <DetailItem label="定休日" value={store.regular_holiday} />
        <DetailItem label="公式サイト" value={store.website} />
        <DetailItem label="Instagram" value={store.instagram} />
        <DetailItem label="支払い方法" value={store.payment_methods.join(", ")} />
        <DetailItem label="説明" value={store.description} />

        {store.image_url && (
          <div className="flex justify-center mt-4">
            <img
              src={store.image_url}
              alt="店舗画像"
              className="w-full max-w-xs rounded shadow"
            />
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.back()}
            className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}

// 共通：ラベルと値を表示
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg">{value || "ー"}</p>
    </div>
  );
}