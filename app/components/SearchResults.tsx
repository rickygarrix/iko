"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { checkIfOpen } from "@/lib/utils";
import { Store } from "../../types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type SearchResultsProps = {
  selectedGenres: string[];
  selectedAreas: string[];
  selectedPayments: string[];
  showOnlyOpen: boolean;
  isSearchTriggered: boolean;
};

export default function SearchResults({
  selectedGenres,
  selectedAreas,
  selectedPayments,
  showOnlyOpen,
  isSearchTriggered,
}: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParams = searchParams.toString();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSearchTriggered) {
      handleSearch();
    }
  }, [isSearchTriggered]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    let query = supabase.from("stores").select("*");

    if (selectedGenres.length > 0) query = query.in("genre", selectedGenres);
    if (selectedAreas.length > 0) query = query.in("area", selectedAreas);
    if (selectedPayments.length > 0)
      query = query.overlaps("payment_methods", selectedPayments);

    const { data, error } = await query;
    if (error) {
      setError(error.message);
      setStores([]);
    } else {
      setStores(
        showOnlyOpen
          ? data.filter((store) => checkIfOpen(store.opening_hours).isOpen)
          : data || []
      );
    }
    setLoading(false);
  };

  return (
    <div className="w-full mt-6 bg-[#FEFCF6]">
      {!isSearchTriggered ? (
        <p className="text-gray-400 text-center px-4">
          🔍 検索条件を選んで「検索」ボタンを押してください
        </p>
      ) : loading ? (
        <p className="mt-6  mb-4 text-center">ロード中...</p>
      ) : error ? (
        <p className="mt-6 text-red-500 text-center mb-4 px-4">⚠️ エラーが発生しました: {error}</p>
      ) : stores.length === 0 ? (
        <p className="text-gray-400 mt-6 text-center mb-4 px-4">該当する店舗がありません。</p>
      ) : (
        // ...検索結果表示

        <div>
          {/* 件数表示 */}
          <p className="text-lg font-semibold mb-6 text-center py-[20px] text-gray-700">
            検索結果 <span className="text-[#4B5C9E]">{stores.length}</span> 件
          </p>

          {/* 検索結果リスト */}
          <div>
            {stores.map((store, index) => {
              const { isOpen, nextOpening } = checkIfOpen(store.opening_hours);

              return (

                <div key={store.id} className="bg-[#FEFCF6] px-4 rounded-xl">

                  <Link href={`/stores/${store.id}?prev=/search&${queryParams}`} passHref>
                    <div className="cursor-pointer space-y-3 pt-4">
                      {/* 店名 */}
                      <h3 className="text-[16px] font-bold text-[#1F1F21] leading-snug">
                        {store.name}
                      </h3>

                      {/* 説明文 */}
                      <p className="text-[12px] text-[#000000] leading-relaxed text-left">
                        {store.description ?? "渋谷で40年の歴史を持つ老舗クラブ。最高音質の音響システムを導入している。"}
                      </p>

                      {/* 下段：画像と情報 */}
                      <div className="flex gap-4 items-center">
                        {/* 画像 */}
                        <div className="w-[160px] h-[90px] border-2 border-black rounded-[8px] overflow-hidden">
                          <img
                            src={store.image_url ?? "/default-image.jpg"}
                            alt={store.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* テキスト情報 */}
                        <div className="text-left space-y-1 text-[14px] text-[#1F1F21]">
                          <p>{store.area} / {store.genre}</p>
                          <p className={`font-semibold ${isOpen ? "text-green-600" : "text-red-500"}`}>
                            {isOpen ? "営業中" : "営業時間外"}
                          </p>
                          <p className="text-xs text-[#1F1F21]">
                            {nextOpening}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 区切り線（最後以外） */}
                  {index !== stores.length - 1 && (
                    <hr className="mt-6 border-t border-gray-300 w-screen -mx-4" />
                  )}
                </div>

              );
            })}
          </div>

          {/* パンくずリスト */}
          <div className="bg-[#FEFCF6] px-4 py-4 text-sm text-gray-800 mt-8">


            <nav className="flex gap-2">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:underline"
              >
                トップに戻る
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
      )
      }
    </div >
  );
}