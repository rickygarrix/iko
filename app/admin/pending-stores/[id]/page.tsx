"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

type Store = {
  id: string;
  name: string;
  genre: string;
  area: string;
  address: string;
  phone_number: string;
  opening_hours: string;
  regular_holiday: string;
  website: string;
  instagram: string;
  payment_methods: string;
  description: string;
  image_url: string;
};

export default function PendingStoreDetailPage() {
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

  const handleApprove = async () => {
    const confirmApprove = window.confirm("この店舗を承認して公開待ちにしますか？");
    if (!confirmApprove || !store) return;

    const { error } = await supabase
      .from("stores")
      .update({ is_pending: false, is_published: false })
      .eq("id", store.id);

    if (error) {
      alert("承認に失敗しました");
      console.error(error.message);
      return;
    }

    alert("承認しました！");
    router.push("/admin/pending-stores"); // 承認後に一覧に戻る
  };

  const handleDelete = async () => {
    if (!store) return;

    const confirmDelete = window.confirm("この店舗を削除しますか？");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("stores")
      .update({ is_deleted: true })
      .eq("id", store.id);

    if (error) {
      alert("削除に失敗しました");
      console.error(error.message);
      return;
    }

    alert("削除しました！");
    router.push("/admin/pending-stores");
  };




  if (loading) return <div className="text-center p-10">読み込み中...</div>;
  if (error) return <div className="text-center text-red-500 p-10">{error}</div>;
  if (!store) return null;

  return (
    <div className="min-h-screen bg-[#FEFCF6] pt-24 px-6 pb-10 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-8">店舗詳細</h1>

      <div className="max-w-2xl mx-auto space-y-6">
        <DetailItem label="店舗名" value={store.name} />
        <DetailItem label="ジャンル" value={store.genre} />
        <DetailItem label="エリア" value={store.area} />
        <DetailItem label="住所" value={store.address} />
        <DetailItem label="電話番号" value={store.phone_number} />
        <DetailItem label="営業時間" value={store.opening_hours} isMultiline />
        <DetailItem label="定休日" value={store.regular_holiday} />
        <DetailItem label="公式サイト" value={store.website} isLink />
        <DetailItem label="Instagramアカウント" value={store.instagram} isLink />
        <DetailItem label="支払い方法" value={store.payment_methods} />
        <DetailItem label="店舗説明" value={store.description} isMultiline />

        {store.image_url && (
          <div className="flex justify-center">
            <Image
              src={store.image_url}
              alt="店舗画像"
              width={400}
              height={300}
              className="rounded shadow"
            />
          </div>
        )}

        {/* ボタンたち */}
        <div className="flex flex-col items-center gap-4 mt-10">
          <button
            onClick={handleApprove}
            className="bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600"
          >
            承認する
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white py-2 px-6 rounded hover:bg-red-600"
          >
            削除する
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  isLink,
  isMultiline,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  isMultiline?: boolean;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-words">
          {value}
        </a>
      ) : (
        <p className={`text-lg ${isMultiline ? "whitespace-pre-line" : "break-words"}`}>
          {value}
        </p>
      )}
    </div>
  );
}