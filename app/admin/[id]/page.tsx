"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image"; // ✅ これを追加！！

// ✅ 型定義
type PendingStore = {
  id: string;
  name: string;
  genre: string;
  address: string;
  phone: string;
  opening_hours: string;
  regular_holiday: string;
  website_url: string;
  instagram_url: string;
  payment_methods: string[];
  description: string;
  image_url: string;
};

export default function PendingStoreDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [store, setStore] = useState<PendingStore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      const { data, error } = await supabase
        .from("pending_stores")
        .select("*")
        .eq("id", id)
        .single<PendingStore>();

      if (error) {
        console.error("取得エラー:", error);
      } else {
        setStore(data);
      }
      setLoading(false);
    };

    if (id) {
      fetchStore();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center p-10">読み込み中...</div>;
  }

  if (!store) {
    return <div className="text-center p-10">データが見つかりませんでした</div>;
  }

  return (
    <div className="min-h-screen bg-[#FEFCF6] p-6">
      <h1 className="text-2xl font-bold text-center mb-6">申請店舗の詳細</h1>

      <div className="max-w-2xl mx-auto bg-white shadow rounded p-6 space-y-4">
        <Info label="店名" value={store.name} />
        <Info label="ジャンル" value={store.genre} />
        <Info label="住所" value={store.address} />
        <Info label="電話番号" value={store.phone} />
        <Info label="営業時間" value={store.opening_hours} />
        <Info label="定休日" value={store.regular_holiday} />
        <Info label="公式サイト" value={store.website_url} />
        <Info label="Instagram" value={store.instagram_url} />
        <Info label="支払い方法" value={(store.payment_methods || []).join(", ")} />
        <Info label="説明" value={store.description} />
        {store.image_url && (
          <div className="flex flex-col items-center">
            <p className="text-gray-600 text-sm">店舗画像</p>
            <Image
              src={store.image_url}
              alt="店舗画像"
              width={400} // ✅ 幅指定
              height={300} // ✅ 高さ指定
              className="w-full max-w-xs rounded shadow mt-2"
            />
          </div>
        )}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={() => router.back()}
          className="bg-gray-500 text-white rounded px-4 py-2 hover:bg-gray-600"
        >
          戻る
        </button>
      </div>
    </div>
  );
}

// 🔹 ラベル＋値を表示するコンポーネント
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg">{value || "ー"}</p>
    </div>
  );
}