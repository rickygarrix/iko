"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import InstagramSlider from "@/components/InstagramSlider";

const DAYS = ["月曜", "火曜", "水曜", "木曜", "金曜", "土曜", "日曜"];

type StoreData = {
  name: string;
  genre: string;
  area: string;
  address: string;
  phone: string;
  openingHoursList: string[];
  websiteUrl: string;
  instagramUrl: string;
  paymentMethods: string[];
  description: string;
  imageUrl: string;
  storeInstagram1: string;
  storeInstagram2: string;
  storeInstagram3: string;
};

export default function StoreConfirmPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [storeData, setStoreData] = useState<StoreData | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("editStoreData");
    if (data) {
      setStoreData(JSON.parse(data));
    }
  }, []);

  const normalizeTime = (text: string) => {
    return text
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248)) // 全角数字→半角
      .replace(/〜/g, "〜") // 全角チルダ→半角
      .trim();
  };

  const buildOpeningHoursText = (list: string[]): string => {
    return list.map((time, idx) => {
      const normalizedTime = normalizeTime(time);
      // すでに「月曜 18:00〜28:00」みたいにフルであればそのまま
      if (normalizedTime.startsWith(DAYS[idx])) {
        return normalizedTime;
      }
      // 「月 18:00〜28:00」など1文字だけだったら上書き
      if (normalizedTime.startsWith(DAYS[idx][0])) {
        return `${DAYS[idx]} ${normalizedTime.slice(1).trim()}`;
      }
      // 休みだけ入力されてた場合（例：水 休み）もカバー
      if (normalizedTime === "休み") {
        return `${DAYS[idx]} 休み`;
      }
      // それ以外は曜日付与
      return `${DAYS[idx]} ${normalizedTime}`;
    }).join("\n");
  };
  const handleSave = async () => {
    if (!storeData) return;

    const { error } = await supabase
      .from("stores")
      .update({
        name: storeData.name,
        genre: storeData.genre,
        area: storeData.area,
        address: storeData.address,
        phone_number: storeData.phone,
        opening_hours: buildOpeningHoursText(storeData.openingHoursList),
        website: storeData.websiteUrl,
        instagram: storeData.instagramUrl,
        payment_methods: storeData.paymentMethods,
        description: storeData.description,
        image_url: storeData.imageUrl,
        store_instagrams: storeData.storeInstagram1,
        store_instagrams2: storeData.storeInstagram2,
        store_instagrams3: storeData.storeInstagram3,
        // ★ storesでは is_published 更新しない！（すでに公開済みの店だから）
      })
      .eq("id", id);

    if (error) {
      alert("保存に失敗しました");
      return;
    }

    alert("保存しました！");
    sessionStorage.removeItem("editStoreData");
    router.push("/admin/stores");
  };

  if (!storeData) {
    return <div className="text-center p-10">データが見つかりませんでした</div>;
  }

  return (
    <div className="min-h-screen bg-[#FEFCF6] pt-24 px-10 pb-10 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-8">店舗情報確認</h1>

      <div className="max-w-2xl mx-auto space-y-4">
        <DetailItem label="店舗名" value={storeData.name} />
        <DetailItem label="ジャンル" value={storeData.genre} />
        <DetailItem label="エリア" value={storeData.area} />
        <DetailItem label="住所" value={storeData.address} />
        <DetailItem label="電話番号" value={storeData.phone} />

        {/* 営業時間 */}
        <div>
          <p className="text-sm text-gray-500">営業時間</p>
          <p className="text-lg whitespace-pre-line">
            {buildOpeningHoursText(storeData.openingHoursList)}
          </p>
        </div>

        <DetailItem label="公式サイト" value={storeData.websiteUrl} isLink />
        <DetailItem label="Instagramアカウント" value={storeData.instagramUrl} isLink />
        <DetailItem label="支払い方法" value={storeData.paymentMethods.join(", ")} />
        <DetailItem label="説明" value={storeData.description} />

        {/* 画像 */}
        {storeData.imageUrl && (
          <div className="flex justify-center mt-4">
            <Image
              src={storeData.imageUrl}
              alt="店舗画像"
              width={400}
              height={300}
              className="rounded shadow"
            />
          </div>
        )}

        {/* Instagramスライダー */}
        <InstagramSlider
          posts={
            [storeData.storeInstagram1, storeData.storeInstagram2, storeData.storeInstagram3]
              .filter((url): url is string => Boolean(url))
          }
        />

        {/* ボタン */}
        <div className="flex justify-center gap-4 mt-10">
          <button
            onClick={() => router.push(`/admin/stores/${id}/edit`)}
            className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600"
          >
            編集に戻る
          </button>

          <button
            onClick={handleSave}
            className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600"
          >
            更新する
          </button>
        </div>
      </div>
    </div>
  );
}

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
        <p className="text-lg break-words">{value}</p>
      )}
    </div>
  );
}