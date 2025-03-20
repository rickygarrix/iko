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
  isSearchTriggered
}: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParams = searchParams.toString(); // 🔹 現在のフィルター情報を保持

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
    if (selectedPayments.length > 0) query = query.overlaps("payment_methods", selectedPayments);

    const { data, error } = await query;
    if (error) {
      setError(error.message);
      setStores([]);
    } else {
      setStores(showOnlyOpen ? data.filter(store => checkIfOpen(store.opening_hours).isOpen) : data || []);
    }
    setLoading(false);
  };

  return (
    <div className="mt-6">
      {!isSearchTriggered ? (
        <p className="text-gray-400">🔍 検索条件を選んで「検索」ボタンを押してください</p>
      ) : loading ? (
        <p className="mt-6">ロード中...</p>
      ) : error ? (
        <p className="mt-6 text-red-500">⚠️ エラーが発生しました: {error}</p>
      ) : stores.length === 0 ? (
        <p className="text-gray-400 mt-6">該当する店舗がありません。</p>
      ) : (
        <div>
          {/* 🔹 検索結果件数を表示 */}
          <p className="text-lg font-semibold mb-4">
            🔍 {stores.length} 件の店舗が見つかりました
          </p>

          {/* 🔹 検索結果一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stores.map((store) => {
              const { isOpen, nextOpening } = checkIfOpen(store.opening_hours);

              return (
                // 🔹 どこをクリックしても遷移できるようにする
                <div
                  key={store.id}
                  className="p-4 bg-gray-800 rounded shadow flex cursor-pointer hover:bg-gray-700 transition"
                  onClick={() => router.push(`/stores/${store.id}?prev=/search&${queryParams}`)}
                >
                  <Image
                    src={store.image_url ?? "/default-image.jpg"}
                    alt={store.name}
                    width={128}
                    height={128}
                    className="w-32 h-32 object-cover rounded"
                  />
                  <div className="ml-4 flex flex-col justify-between">
                    <h2 className="text-xl font-semibold">{store.name}</h2>
                    <p className="text-gray-400">📍 {store.area} / 🎵 {store.genre}</p>
                    <p className={isOpen ? "text-green-400" : "text-red-400"}>{isOpen ? "営業中" : "営業時間外"}</p>
                    <p className="text-white">{nextOpening}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 🔹 トップに戻るボタン */}
          <div className="mt-8 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              ↑ トップに戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
}