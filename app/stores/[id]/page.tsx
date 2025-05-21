"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Skeleton from "@/components/Skeleton";
import MapEmbed from "@/components/MapEmbed";
import InstagramSlider from "@/components/InstagramSlider";
import NewPostModal from "@/components/NewPostModal";
import type { User } from "@supabase/supabase-js";
import { sendGAEvent } from "@/lib/ga";
import type { Store, TagCategory } from "@/types/schema";
import { useRouter } from "next/navigation";

export default function StoreDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [tagCategories, setTagCategories] = useState<TagCategory[]>([]);

  const { data: store, error, isLoading } = useSWR<Store>(
    id ? ["store", id] : null,
    async ([, id]) => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) throw new Error(error?.message || "データ取得失敗");
      return data;
    },
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase
      .from("tag_categories")
      .select("*")
      .then(({ data }) => {
        if (data) setTagCategories(data);
      });
  }, []);

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
        {store.map_embed && (
          <div className="mb-4">
            <a
              href={store.map_link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                sendGAEvent("click_map", { store_id: store.id, store_name: store.name });
              }}
            >
              <MapEmbed src={store.map_embed} title={`${store.name}の地図`} />
            </a>
          </div>
        )}

        <div className="p-4">
          <h1 className="text-2xl font-bold mb-1">{store.name}</h1>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">
            {store.description}
          </p>
        </div>

        {/* 投稿＆フォローボタン */}
        {user && (
          <div className="flex justify-end gap-4 px-4 mb-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            >
              投稿する
            </button>
            {/* フォロー機能仮置き（将来的に制御関数追加） */}
            <button
              className="bg-gray-600 text-white px-4 py-1 rounded hover:bg-gray-700"
              onClick={() => {
                supabase.from("store_follows").upsert({ user_id: user.id, store_id: store.id });
              }}
            >
              フォロー
            </button>
          </div>
        )}

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
                  <p className="text-[10px] text-gray-500 mt-1">※日により変更する可能性があります。</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <InstagramSlider
          posts={[store.store_instagrams, store.store_instagrams2, store.store_instagrams3].filter((url): url is string => Boolean(url))}
        />

        {store.website && (
          <div className="px-4 pb-4">
            <a
              href={store.website}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-[358px] h-[48px] bg-black text-white rounded-lg hover:bg-gray-800 flex items-center justify-center mx-auto"
              onClick={() => {
                sendGAEvent("click_official_website", {
                  store_id: store.id,
                  store_name: store.name,
                  website_url: store.website,
                });
              }}
            >
              公式サイト →
            </a>
          </div>
        )}
      </div>

      {/* 投稿モーダル */}
      {showModal && user && (
        <NewPostModal
          selectedStore={{ id: store.id, name: store.name }} // ← ここで固定指定
          tagCategories={tagCategories}
          user={user}
          onClose={() => setShowModal(false)}
          onPosted={() => {
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
