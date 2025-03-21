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
          <p className="text-lg font-semibold mb-6 text-center text-gray-700">
            検索結果 <span className="text-blue-500">{stores.length}</span> 件
          </p>

          {/* 検索結果リスト */}
          <div>
            {stores.map((store, index) => {
              const { isOpen, nextOpening } = checkIfOpen(store.opening_hours);

              return (
                <div key={store.id}>
                  {/* 店舗情報カード */}
                  <div
                    className="bg-[#FDFBF7] p-4 transition cursor-pointer"
                    onClick={() =>
                      router.push(`/stores/${store.id}?prev=/search&${queryParams}`)
                    }
                  >
                    {/* 店名 & 説明 */}
                    <h2 className="text-base font-bold text-gray-800 mb-1">{store.name}</h2>
                    <p className="text-sm text-gray-600 mb-3">{store.description}</p>

                    {/* 画像 + 詳細 */}
                    <div className="flex flex-row items-start gap-4">
                      <Image
                        src={store.image_url ?? "/default-image.jpg"}
                        alt={store.name}
                        width={160}
                        height={120}
                        className="object-cover w-40 h-32"
                      />
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>{store.area} エリア</p>
                        <p>{store.genre}</p>
                        <p className={isOpen ? "text-green-600" : "text-red-500"}>
                          {isOpen ? "営業中" : "営業時間外"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isOpen
                            ? `${nextOpening}`
                            : `${nextOpening} `}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 店舗間の仕切り線（最後の店舗以外） */}
                  {index !== stores.length - 1 && (
                    <hr className="my-4 border-t border-gray-300" />
                  )}
                </div>
              );
            })}
          </div>

          {/* パンくずリスト */}
          <div className="bg-[#FAFAF5] py-4 px-6 text-sm text-gray-800 mt-8">
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
      )}
    </div>
  );
}