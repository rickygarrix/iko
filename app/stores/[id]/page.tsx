"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { checkIfOpen } from "@/lib/utils";
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
  instagram?: string | null;
  payment_methods: string[];
  address: string;
  phone: string;
  website?: string;
  image_url?: string;
  description: string;
  access: string;
  map_embed?: string;
  map_link?: string;
};

export default function StoreDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  const previousPage = searchParams.get("prev") || "";
  const queryParams = searchParams.toString();

  useEffect(() => {
    const fetchStore = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("🔥 Supabase Error:", error.message);
        setStore(null);
      } else {
        setStore(data);
      }
      setLoading(false);
    };

    fetchStore();

    const savedCenter = sessionStorage.getItem("mapCenter");
    if (savedCenter) {
      const parsedCenter = JSON.parse(savedCenter);
      setMapCenter(parsedCenter);
      sessionStorage.setItem("mapCenter", JSON.stringify(parsedCenter));
    }
  }, [id]);

  if (loading) return <p className="text-center mt-6 text-gray-600">ロード中...</p>;
  if (!store) return <p className="text-center mt-6 text-red-500">店舗が見つかりませんでした。</p>;

  const handleBack = () => {
    if (previousPage === "/map") {
      if (mapCenter) {
        sessionStorage.setItem("mapCenter", JSON.stringify(mapCenter));
      }
      router.push(`/map?${queryParams}`);
    } else {
      router.back();
    }
  };

  const { isOpen, nextOpening } = checkIfOpen(store.opening_hours);

  return (
    <div className="min-h-screen bg-[#FEFCF6] text-gray-800 ">
      <div className="mx-auto bg-[#FDFBF7] shadow-md rounded-lg overflow-hidden">

        {/* Googleマップ埋め込み */}
        {store.map_embed && (
          <div className="mb-4">
            <iframe
              src={store.map_embed}
              width={800}
              height={500}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-[120px] object-cover"
            ></iframe>
          </div>
        )}

        <div className="p-4">
          {/* 店舗名・紹介文 */}
          <h1 className="text-2xl font-bold mb-1">{store.name}</h1>
          <p className="text-xs h-[7px] text-[#4B5C9E] font-bold mb-0">{store.name_read}</p>

          <p className="text-sm text-[#1F1F21] h-[26px] pt-8 leading-relaxed mb-4">
            {store.description}
          </p>

          {/* ジャンル・料金・営業時間 */}
          <div className="mb-6 space-y-1 pt-12 text-sm text-[#1F1F21]">
            <div className="flex items-center gap-1">
              <span>{store.genre} / {store.area}</span>
            </div>

            <div className="items-center gap-3">
              {/* アイコンと入場料 */}
              <div className="flex items-center gap-1">
                <img src="/icons/yen.svg" alt="yen icon" className="w-4 h-4" />
                <span>{store.entry_fee}</span>
              </div>

              {/* アイコンと営業時間 */}
              <div className=" flex  pt-1 items-center gap-1">
                <img src="/icons/time.svg" alt="time icon" className="w-4 h-4" />
                <p className={`font-semibold ${isOpen ? "text-green-600" : "text-red-500"}`}>
                  {isOpen ? "営業中" : "営業時間外"}
                </p>
              </div>

              <div className="px-5 pt-1 items-center gap-1">
                <p className="text-xs text-[#1F1F21]">
                  {nextOpening}
                </p>
              </div>


            </div>
          </div>
        </div>

        {/* 支払い方法 表形式 */}
        <div className="mb-8 pl-4 pr-4">
          <p className="font-bold text-base mb-2 flex items-center gap-2">
            <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded-[2px] inline-block" />
            支払い方法
          </p>

          <table className="w-full border border-[#E7E7EF] text-sm text-left text-black">
            <tbody>
              {[
                ["現金", "クレジットカード"],
                ["電子マネー", "コード決済"],
                ["交通系IC", "その他"],
              ].map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((method, colIndex) => (
                    <React.Fragment key={colIndex}>
                      {/* 左側：項目セル */}
                      <td className="border border-[#E7E7EF] px-3 py-2 w-[40%]">
                        {method}
                      </td>

                      {/* 右側：◯ or ― */}
                      <td className="border border-[#E7E7EF] px-3 py-2 w-[10%] text-center align-middle">
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

        {/* 店舗情報 表形式 */}
        <div className="my-10 pl-4 pr-4 pt-0">
          <div className="mb-0">
            <p className="font-bold text-base mb-2 flex items-center gap-2">
              <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded-[2px] inline-block" />
              店舗情報
            </p>
            <table className="w-full border border-[#E7E7EF] text-sm table-fixed">
              <tbody>
                <tr>
                  <th className="border border-[#E7E7EF] px-4 py-4 bg-[#FDFBF7] text-left align-middle font-normal w-[90px]">
                    店舗名
                  </th>
                  <td className="border border-[#E7E7EF] px-4 py-4">
                    {store.name}
                  </td>
                </tr>
                <tr>
                  <th className="border border-[#E7E7EF] px-4 py-4 bg-[#FDFBF7] text-left align-middle font-normal">
                    所在地
                  </th>
                  <td className="border border-[#E7E7EF] px-4 py-4 whitespace-pre-wrap">
                    {store.address}
                  </td>
                </tr>
                <tr>
                  <th className="border border-[#E7E7EF] px-4 py-4 bg-[#FDFBF7] text-left align-middle font-normal">
                    アクセス
                  </th>
                  <td className="border border-[#E7E7EF] px-4 py-4 whitespace-pre-wrap">
                    {store.access}
                  </td>
                </tr>
                <tr>
                  <th className="border border-[#E7E7EF] px-4 py-4 bg-[#FDFBF7] text-left align-middle font-normal">
                    営業時間
                  </th>
                  <td className="border border-[#E7E7EF] px-4 py-4 whitespace-pre-wrap">
                    {store.opening_hours}
                    <p className="text-[10px] text-gray-500 mt-1">
                      ※日により変更する可能性があります。
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 公式サイト */}
        <div className="px-4">
          {store.website && (
            <a
              href={store.website}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-[358px] h-[48px] bg-black text-white rounded-lg hover:bg-gray-800
                 flex items-center justify-center mx-auto"
            >
              公式サイト →
            </a>
          )}
        </div>

        {/* 戻るボタン（左寄せ） */}
        <div className="mt-6">
          <button
            onClick={handleBack}
            className="text-base px-4 text-blue-600 underline hover:text-blue-800 font-medium"
          >
            ← 戻る
          </button>
        </div>

        {/* パンくずリスト（左寄せ、余白調整） */}
        <div className="mt-4 text-sm px-4 pb-4  pt-4 bg-[#F7F5EF] text-gray-800">
          <nav className="flex gap-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:underline"
            >
              トップに戻る
            </button>
            <span>/</span>
            <button
              onClick={() => router.push("/search")}
              className="hover:underline"
            >
              条件検索
            </button>
            <span>/</span>
            <button
              onClick={() => router.push("/map")}
              className="hover:underline"
            >
              地図から探す
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}