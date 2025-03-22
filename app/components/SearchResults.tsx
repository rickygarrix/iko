"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { checkIfOpen } from "@/lib/utils";
import { Store } from "../../types";
import Image from "next/image";
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
    <div className="mt-6">
      {!isSearchTriggered ? (
        <p className="text-gray-400">
          🔍 検索条件を選んで「検索」ボタンを押してください
        </p>
      ) : loading ? (
        <p className="mt-6">ロード中...</p>
      ) : error ? (
        <p className="mt-6 text-red-500">⚠️ エラーが発生しました: {error}</p>
      ) : stores.length === 0 ? (
        <p className="text-gray-400 mt-6">該当する店舗がありません。</p>
      ) : (
        <div>
          {/* 件数表示 */}
          <p className="text-lg font-semibold mb-6 text-gray-700">
            検索結果 <span className="text-blue-500">{stores.length}</span> 件
          </p>

          {/* 検索結果リスト */}
          <div className="space-y-6">
            {stores.map((store) => {
              const { isOpen, nextOpening } = checkIfOpen(store.opening_hours);

              return (
                <div
                  key={store.id}
                  className="flex flex-col md:flex-row items-start bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition"
                  onClick={() =>
                    router.push(`/stores/${store.id}?prev=/search&${queryParams}`)
                  }
                >
                  {/* 店舗画像 */}
                  <Image
                    src={store.image_url ?? "/default-image.jpg"}
                    alt={store.name}
                    width={160}
                    height={120}
                    className="w-full md:w-48 h-36 object-cover"
                  />

                  {/* 情報エリア */}
                  <div className="p-4 flex-1 text-left">
                    {/* 店舗名 */}
                    <h2 className="text-lg font-bold text-gray-800 mb-1">
                      {store.name}
                    </h2>

                    {/* 説明 */}
                    <p className="text-sm text-gray-600 mb-3">
                      {store.description ?? "説明がありません。"}
                    </p>

                    {/* 詳細情報 */}
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>📍 {store.area} エリア</p>
                      <p>🎵 {store.genre}</p>
                      <p className={isOpen ? "text-green-600" : "text-red-500"}>
                        {isOpen ? "営業中" : "営業時間外"}
                      </p>
                      {!isOpen && (
                        <p className="text-gray-500 text-xs">
                          次の営業: {nextOpening}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* パンくずリスト */}
          <div className="bg-[#FAFAF5] py-4 px-6 text-sm text-gray-800">
            <nav className="flex gap-2">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:underline"
              >
                トップ
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
      )}
    </div>
  );
}