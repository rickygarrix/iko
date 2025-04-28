// app/stores/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import Skeleton from "@/components/Skeleton";
import MapEmbed from "@/components/MapEmbed";
import InstagramSlider from "@/components/InstagramSlider";
import React from "react";

type Store = {
  id: string;
  name: string;
  genre_ids: string[];
  area: string;
  opening_hours: string;
  regular_holiday: string;
  capacity: string;
  payment_methods: string[];
  address: string;
  phone: string;
  website?: string;
  description: string;
  access: string;
  map_embed?: string;
  map_link?: string;
  payment_method_ids: string;
  store_instagrams?: string | null;
  store_instagrams2?: string | null;
  store_instagrams3?: string | null;
};

// Supabase から店舗データを取得する fetcher
const fetchStore = async (id: string): Promise<Store> => {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) {
    throw new Error(error?.message || "データが見つかりませんでした");
  }
  return data;
};

export default function StoreDetailPage() {
  const { id } = useParams();
  const { data: store, error, isLoading } = useSWR<Store>(
    id ? ["store", id] : null,
    ([, id]) => fetchStore(id as string),
    { revalidateOnFocus: false }
  );

  // ローディング中はスケルトン表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FEFCF6] text-gray-800 pt-[48px] flex justify-center">
        <div className="w-full max-w-[600px] p-6 space-y-6">
          <Skeleton width="100%" height={24} />
          <Skeleton width="60%" height={16} />
          <Skeleton width="100%" height={80} />
          <Skeleton width="100%" height={200} />
        </div>
      </div>
    );
  }

  // エラーまたはデータなし
  if (error || !store) {
    return (
      <div className="min-h-screen bg-[#FEFCF6] text-center pt-[100px] text-red-500">
        店舗が見つかりませんでした。
      </div>
    );
  }

  // ID → 表示名のマップ

  const genreLabels: Record<string, string> = {
    jazz: "ジャズ",
    house: "ハウス",
    techno: "テクノ",
    edm: "EDM",
    hiphop: "ヒップホップ",
    pop: "ポップス",
    rock: "ロック",
    reggae: "レゲエ",
    other: "その他",
  };

  return (
    <div className="min-h-screen bg-[#FEFCF6] text-gray-800 pt-[48px]">
      <div className="w-full max-w-[600px] mx-auto bg-[#FDFBF7] shadow-md rounded-lg overflow-hidden">

        {/* Googleマップ埋め込み */}
        {store.map_embed && (
          <div className="mb-4">
            <a
              href={store.map_link || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapEmbed src={store.map_embed} title={`${store.name}の地図`} />
            </a>
          </div>
        )}

        {/* 店舗名・説明 */}
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-1">{store.name}</h1>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">
            {store.description}
          </p>
        </div>

        {/*
        <div className="px-4 mb-8">
          <p className="text-base mb-2 flex items-center gap-2 text-[#1F1F21]">
            <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded inline-block" />
            支払い方法
          </p>
          <div className="w-full overflow-hidden rounded border border-[#E7E7EF]">
            <table className="w-full table-auto text-xs text-[#1F1F21] font-light">
              <tbody>
                {Object.entries(paymentMethodLabels)
                  .reduce<[string, string][][]>((rows, entry, idx) => {
                    if (idx % 2 === 0) rows.push([entry]);
                    else rows[rows.length - 1].push(entry);
                    return rows;
                  }, [])
                  .map((pair, i) => (
                    <tr key={i} className="border-t border-[#E7E7EF] h-[42px]">
                      {pair.map(([id, label]) => (
                        <React.Fragment key={id}>
                          <td className="w-[42%] px-3 py-3 border-r border-[#E7E7EF]">
                            {label}
                          </td>
                          <td className="w-[8%] px-2 py-3 text-center border-r border-[#E7E7EF]">
                            {(store.payment_method_ids ?? []).includes(id) ? "◯" : "ー"}
                          </td>
                        </React.Fragment>
                      ))}
                      {pair.length === 1 && (
                        <>
                          <td className="w-[42%] px-3 py-3 border-r border-[#E7E7EF]"></td>
                          <td className="w-[8%] px-2 py-3 border-r border-[#E7E7EF]"></td>
                        </>
                      )}paymentMethodLabels
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        */}

        {/* 店舗情報 */}
        <div className="my-10 px-4">
          <p className="text-base mb-2 flex items-center gap-2 text-[#1F1F21]">
            <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded-[2px] inline-block" />
            店舗情報
          </p>
          <table className="w-full border border-[#E7E7EF] text-sm table-fixed text-black">
            <tbody>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal w-[90px]">
                  店舗名
                </th>
                <td className="border px-4 py-4">{store.name}</td>
              </tr>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal">
                  ジャンル
                </th>
                <td className="border px-4 py-4 whitespace-pre-wrap">
                  {store.genre_ids?.map((gid) => genreLabels[gid] || gid).join(" / ")}
                </td>
              </tr>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal">
                  所在地
                </th>
                <td className="border px-4 py-4 whitespace-pre-wrap">
                  {store.address}
                </td>
              </tr>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal">
                  アクセス
                </th>
                <td className="border px-4 py-4 whitespace-pre-wrap">
                  {store.access}
                </td>
              </tr>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal">
                  営業時間
                </th>
                <td className="border px-4 py-4 whitespace-pre-wrap">
                  {store.opening_hours}
                  <p className="text-[10px] text-gray-500 mt-1">
                    ※日により変更する可能性があります。
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Instagram スライダー */}
        <InstagramSlider
          posts={[
            store.store_instagrams,
            store.store_instagrams2,
            store.store_instagrams3,
          ].filter((url): url is string => Boolean(url))}
        />

        {/* 公式サイトリンク */}
        {store.website && (
          <div className="px-4 pb-4">
            <a
              href={store.website}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-[358px] h-[48px] bg-black text-white rounded-lg hover:bg-gray-800 flex items-center justify-center mx-auto"
            >
              公式サイト →
            </a>
          </div>
        )}

      </div>
    </div>
  );
}