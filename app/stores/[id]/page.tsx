"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { logAction } from "@/lib/utils"; // ✅ logAction使う
import Skeleton from "@/components/Skeleton";
import MapEmbed from "@/components/MapEmbed";
import InstagramSlider from "@/components/InstagramSlider";
import React from "react";

type Store = {
  id: string;
  name: string;
  genre: string;
  area: string;
  name_read?: string;
  entry_fee: string;
  opening_hours: string;
  regular_holiday: string;
  capacity: string;
  instagram: string | null;
  payment_methods: string[];
  address: string;
  phone: string;
  website?: string;
  image_url?: string;
  description: string;
  access: string;
  map_embed?: string;
  map_link?: string;
  store_instagrams?: string | null;
  store_instagrams2?: string | null;
  store_instagrams3?: string | null;
};

const fetchStore = async (id: string): Promise<Store> => {
  const { data, error } = await supabase.from("stores").select("*").eq("id", id).single();
  if (error || !data) {
    throw new Error(error?.message || "データが見つかりませんでした");
  }
  return data;
};

export default function StoreDetail() {
  const { id } = useParams();
  const { data: store, error, isLoading } = useSWR<Store>(
    id ? ["store", id] : null,
    ([, id]) => fetchStore(id as string),
    { revalidateOnFocus: false }
  );

  // ✅ ページ表示時にアクセスログ
  useEffect(() => {
    if (id) {
      logAction("open_store", { store_id: id, referrer_page: document.referrer || null });
    }
  }, [id]);

  // ✅ Instagram投稿クリック
  const handleInstagramPostClick = async (url: string) => {
    if (id) {
      await logAction("click_instagram_post", { store_id: id, detail: url });
    }
  };

  // ✅ 公式Instagramアカウントクリック
  const handleInstagramAccountClick = async () => {
    if (id) {
      await logAction("click_instagram_account", { store_id: id });
    }
  };

  // ✅ Googleマップクリック
  const handleMapClick = async () => {
    if (id) {
      await logAction("click_map", { store_id: id });
    }
  };

  // ✅ 公式サイトクリック
  const handleWebsiteClick = async () => {
    if (id) {
      await logAction("click_website", { store_id: id });
    }
  };

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

  if (error || !store) {
    return (
      <div className="min-h-screen bg-[#FEFCF6] text-center pt-[100px] text-red-500">
        店舗が見つかりませんでした。
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCF6] text-gray-800 pt-[48px]">
      <div className="w-full max-w-[600px] mx-auto bg-[#FDFBF7] shadow-md rounded-lg">

        {/* Googleマップ */}
        {store.map_embed && (
          <div className="mb-4">
            <a href={store.map_link || "#"} target="_blank" rel="noopener noreferrer" onClick={handleMapClick}>
              <MapEmbed src={store.map_embed} title={`${store.name}の地図`} />
            </a>
          </div>
        )}

        {/* 店舗名・説明 */}
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-1">{store.name}</h1>
          <p className="text-sm text-[#1F1F21] pt-4 leading-relaxed mb-4 whitespace-pre-line">
            {store.description}
          </p>
        </div>

        {/* 支払い方法 */}
        <div className="mb-8 px-4">
          <p className="text-base mb-2 flex items-center gap-2 font-[#1F1F21]">
            <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded-[2px] inline-block" />
            支払い方法
          </p>
          <table className="w-full border border-[#E7E7EF] text-sm text-left text-black">
            <tbody>
              {["現金", "クレジットカード", "電子マネー", "コード決済", "交通系IC", "その他"]
                .reduce((rows, key, idx) => {
                  if (idx % 2 === 0) rows.push([key]);
                  else rows[rows.length - 1].push(key);
                  return rows;
                }, [] as string[][])
                .map((row, i) => (
                  <tr key={i}>
                    {row.map((method, j) => (
                      <React.Fragment key={j}>
                        <td className="border border-[#E7E7EF] px-3 py-2 w-[40%]">{method}</td>
                        <td className="border border-[#E7E7EF] px-3 py-2 w-[10%] text-center">
                          {method === "その他"
                            ? "ー"
                            : store.payment_methods.includes(method)
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
          <p className="text-base mb-2 flex items-center gap-2 font-[#1F1F21]">
            <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded-[2px] inline-block" />
            店舗情報
          </p>
          <table className="w-full border border-[#E7E7EF] text-sm table-fixed">
            <tbody>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal w-[90px]">店舗名</th>
                <td className="border px-4 py-4">{store.name}</td>
              </tr>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal">ジャンル</th>
                <td className="border px-4 py-4">{store.genre}</td>
              </tr>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal">所在地</th>
                <td className="border px-4 py-4 whitespace-pre-wrap">{store.address}</td>
              </tr>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal">アクセス</th>
                <td className="border px-4 py-4 whitespace-pre-wrap">{store.access}</td>
              </tr>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal">営業時間</th>
                <td className="border px-4 py-4 whitespace-pre-wrap">
                  {store.opening_hours}
                  <p className="text-[10px] text-gray-500 mt-1">※日により変更する可能性があります。</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Instagramスライダーだけ表示 */}
        <InstagramSlider
          posts={[
            store.store_instagrams,
            store.store_instagrams2,
            store.store_instagrams3,
          ].filter((url): url is string => Boolean(url))}
          onClickPost={handleInstagramPostClick}
        />

        {/* 公式サイト */}
        {store.website && (
          <div className="px-4 pb-4">
            <a
              href={store.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWebsiteClick}
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