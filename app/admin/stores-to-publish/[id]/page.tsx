"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

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
  is_published: boolean;
};

export default function StoreToPublishDetailPage() {
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
        .eq("is_published", false) // 未公開のみ
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

  if (loading) {
    return <div className="text-center p-10">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-10">{error}</div>;
  }

  if (!store) {
    return <div className="text-center p-10">データが見つかりませんでした</div>;
  }

  return (
    <div className="min-h-screen bg-[#FEFCF6] p-6">
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">未公開店舗の詳細</h1>

        {/* 詳細項目リスト */}
        <div className="space-y-4">
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

          {/* 店舗画像 */}
          {store.image_url && (
            <div className="flex flex-col items-center mt-6">
              <p className="text-gray-500 text-sm mb-1">店舗画像</p>
              <Image
                src={store.image_url}
                alt="店舗画像"
                width={400}
                height={300}
                className="rounded shadow"
              />
            </div>
          )}
        </div>

        {/* 戻るボタン */}
        <div className="flex justify-center mt-8">
          <Link
            href="/admin/stores-to-publish"
            className="bg-gray-600 text-white py-2 px-6 rounded hover:bg-gray-700"
          >
            戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

// 共通：ラベルと値の表示
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg text-gray-800 whitespace-pre-wrap">{value || "ー"}</p>
    </div>
  );
}