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
  genre: string;
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

  // 支払い方法に表示するメソッド（「その他」は除外）
  const methods = ["現金", "クレジットカード", "電子マネー", "コード決済", "交通系IC"];

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

        {/* 支払い方法 */}
        <div className="mb-8 px-4">
          <p className="text-base mb-2 flex items-center gap-2 text-[#1F1F21]">
            <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded inline-block" />
            支払い方法
          </p>
          <table className="w-full border border-[#E7E7EF] text-sm text-left text-black">
            <tbody>
              {methods
                .reduce<string[][]>((rows, method, idx) => {
                  if (idx % 2 === 0) rows.push([method]);
                  else rows[rows.length - 1].push(method);
                  return rows;
                }, [])
                .map((pair, i) => (
                  <tr key={i}>
                    {pair.map((method) => (
                      <React.Fragment key={method}>
                        <td className="border border-[#E7E7EF] px-3 py-2 w-1/2 text-black">
                          {method}
                        </td>
                        <td className="border border-[#E7E7EF] px-3 py-2 w-1/6 text-center text-black">
                          {(store.payment_methods ?? []).includes(method)
                            ? "◯"
                            : "ー"}
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

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
                <td className="border px-4 py-4">{store.genre}</td>
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