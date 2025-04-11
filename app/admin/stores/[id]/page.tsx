"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import InstagramSlider from "@/components/InstagramSlider";

// 型定義を編集ページと揃える！
type Store = {
  id: string;
  name: string;
  genre: string;
  area: string;
  address: string;
  phone: string;
  opening_hours: string;
  website_url: string;
  instagram_url: string;
  payment_methods: string[];
  description: string;
  image_url: string;
  store_instagrams: string | null;
  store_instagrams2: string | null;
  store_instagrams3: string | null;
};

const DAYS = ["月", "火", "水", "木", "金", "土", "日"];

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
    <div className="min-h-screen bg-[#FEFCF6] pt-24 px-10 pb-10 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-8">店舗詳細</h1>

      <div className="max-w-2xl mx-auto space-y-4">
        <DetailItem label="店名" value={store.name} />
        <DetailItem label="ジャンル" value={store.genre} />
        <DetailItem label="エリア" value={store.area} />
        <DetailItem label="住所" value={store.address} />
        <DetailItem label="電話番号" value={store.phone} />

        {/* 営業時間だけ特別に整形 */}
        <div>
          <p className="text-sm text-gray-500">営業時間</p>
          <div className="text-lg whitespace-pre-line">
            {parseOpeningHours(store.opening_hours)}
          </div>
        </div>

        <DetailItem label="公式サイト" value={store.website_url} isLink />
        <DetailItem label="Instagramアカウント" value={store.instagram_url} isLink />
        <DetailItem label="支払い方法" value={store.payment_methods.join(", ")} />
        <DetailItem label="説明" value={store.description} />

        {store.image_url && (
          <div className="flex justify-center mt-4">
            <Image
              src={store.image_url}
              alt="店舗画像"
              width={400}
              height={300}
              className="rounded shadow"
            />
          </div>
        )}

        {/* Instagramスライダー */}
        <InstagramSlider posts={
          [store.store_instagrams, store.store_instagrams2, store.store_instagrams3]
            .filter((url): url is string => Boolean(url))
        } />

        {/* ボタン */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => router.push("/admin/stores")}
            className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600"
          >
            戻る
          </button>
          <button
            onClick={() => router.push(`/admin/stores/${store.id}/edit`)}
            className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600"
          >
            編集する
          </button>
        </div>
      </div>
    </div>
  );
}

// 共通：ラベルと値を表示
function DetailItem({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-words">
          {value}
        </a>
      ) : (
        <p className="text-lg break-words">{value || "ー"}</p>
      )}
    </div>
  );
}

// 営業時間を曜日ごとに改行整形する
function parseOpeningHours(text: string): string {
  const lines = text.split("\n").filter(Boolean);
  return lines.map(line => line.trim()).join("\n");
}
