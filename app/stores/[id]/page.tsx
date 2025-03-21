"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { checkIfOpen } from "@/lib/utils"; // ← 営業時間判定関数

type Store = {
  id: string;
  name: string;
  genre: string;
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

  if (loading) return <p className="text-center text-gray-600">ロード中...</p>;
  if (!store) return <p className="text-center text-red-500">店舗が見つかりませんでした。</p>;

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
    <div className="min-h-screen bg-[#FDFBF7] text-gray-800 ">
      <div className="max-w-3xl mx-auto bg-[#FDFBF7] shadow-md rounded-lg overflow-hidden">



        {/* 店舗画像 */}
        {store.image_url && (
          <Image
            src={store.image_url}
            alt={store.name}
            width={800}
            height={400}
            className="w-full h-64 object-cover"
          />
        )}

        <div className="p-6">
          {/* 店舗名・紹介文 */}
          <h1 className="text-2xl font-bold mb-1">{store.name}</h1>
          <p className="text-sm text-gray-600 mb-4">{store.description}</p>

          {/* ジャンル・料金・営業中かどうか */}
          <div className="mb-6 text-sm space-y-2">
            <p><strong>ジャンル:</strong> {store.genre}</p>
            <p><strong>入場料:</strong> {store.entry_fee}</p>
            <p className={isOpen ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
              {isOpen ? "営業中" : "営業時間外"}
            </p>
            <p className="text-sm text-gray-700">
              {isOpen ? `終了時間：${nextOpening}` : `次の営業：${nextOpening}から`}
            </p>
          </div>

          {/* 支払い方法 表形式 */}
          <div className="mb-8">
            <p className="font-semibold mb-2">■ 支払い方法</p>
            <table className="w-full border border-gray-300 text-sm text-center">
              <thead>
                <tr>
                  <th className="border px-4 py-2 bg-gray-50">現金</th>
                  <th className="border px-4 py-2 bg-gray-50">クレジットカード</th>
                  <th className="border px-4 py-2 bg-gray-50">電子マネー</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {["現金", "クレジットカード", "電子マネー"].map((method) => (
                    <td key={method} className="border px-4 py-2">
                      {store.payment_methods.includes(method) ? "◯" : ""}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          {/* 店舗情報 表形式 */}
          <div className="my-10">
            <div className="mb-10">
              <p className="font-semibold my-4">■ 店舗情報</p>
              <table className="w-full border border-gray-300 text-sm">
                <tbody>
                  <tr>
                    <th className="border px-4 py-4 bg-gray-50 text-left w-32">店舗名</th>
                    <td className="border px-4 py-4">{store.name}</td>
                  </tr>
                  <tr>
                    <th className="border px-4 py-4 bg-gray-50 text-left">所在地</th>
                    <td className="border px-4 py-4">{store.address}</td>
                  </tr>
                  <tr>
                    <th className="border px-4 py-4 bg-gray-50 text-left">アクセス</th>
                    <td className="border px-4 py-4">{store.access}</td>
                  </tr>
                  <tr>
                    <th className="border px-4 py-4 bg-gray-50 text-left">営業時間</th>
                    <td className="border px-4 py-4 whitespace-pre-wrap">{store.opening_hours}</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-1">※日により変更する可能性があります。</p>
            </div>
          </div>

          {/* Googleマップ埋め込み */}
          {store.map_embed && (
            <div className="my-6">
              <iframe
                src={store.map_embed}
                width="100%"
                height="300"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="border-0 w-full h-64 rounded"
              ></iframe>
            </div>
          )}

          {/* 公式サイト */}
          {store.website && (
            <a
              href={store.website}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-black text-white py-2 rounded hover:bg-gray-800"
            >
              公式サイト →
            </a>
          )}

          {/* 戻るボタン（左寄せ） */}
          <div className="mt-6">
            <button
              onClick={handleBack}
              className="text-base text-blue-600 underline hover:text-blue-800 font-medium"
            >
              ← 戻る
            </button>
          </div>

          {/* パンくずリスト（左寄せ、余白調整） */}
          <div className="mt-4 text-sm text-gray-800">
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
    </div>
  );
}