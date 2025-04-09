"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ApproveButton } from "./ApproveButton";
import { DeleteButton } from "./DeleteButton";
import { PublishButton } from "./PublishButton";
import Image from "next/image";
import Link from "next/link";

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
        console.error("データ取得エラー:", error);
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
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-8">
        <h1 className="text-2xl font-bold mb-6">店舗詳細</h1>

        <div className="space-y-4">
          <DetailItem label="店名" value={store.name} />
          <DetailItem label="ジャンル" value={store.genre} />
          <DetailItem label="住所" value={store.address} />
          <DetailItem label="電話番号" value={store.phone} />
          <DetailItem label="営業時間" value={store.opening_hours} />
          <DetailItem label="定休日" value={store.regular_holiday} />
          <DetailItem label="公式サイトURL" value={store.website_url} />
          <DetailItem label="Instagramアカウント" value={store.instagram_url} />
          <DetailItem label="支払い方法" value={store.payment_methods.join(", ")} />
          <DetailItem label="店舗説明" value={store.description} />

          {store.image_url && (
            <div className="flex flex-col items-center">
              <p className="text-gray-500 text-sm mb-1">店舗画像</p>
              <Image
                src={store.image_url}
                alt="店舗外観"
                width={400}
                height={300}
                className="w-full max-w-xs rounded shadow mt-2"
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <ApproveButton id={id} />
          <DeleteButton id={id} />
          <PublishButton id={id} />
          <Link
            href="/admin/pending-stores"
            className="inline-block bg-gray-600 text-white py-2 px-6 rounded hover:bg-gray-700"
          >
            戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-gray-800 text-lg whitespace-pre-wrap">{value || "ー"}</p>
    </div>
  );
}