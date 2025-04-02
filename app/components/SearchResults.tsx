"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { checkIfOpen } from "@/lib/utils";
import { Store } from "../../types";
import { useSearchParams, useRouter } from "next/navigation";

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
  const searchParams = useSearchParams();
  const queryParams = searchParams.toString();
  const router = useRouter();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoreY, setRestoreY] = useState<number | null>(null);

  // 検索処理
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

  // 検索ボタン押されたら検索
  useEffect(() => {
    if (isSearchTriggered) {
      handleSearch();
    }
  }, [isSearchTriggered]);

  // ✅ 戻ってきたときに scrollY を取得
  useEffect(() => {
    const savedY = sessionStorage.getItem("scrollY");
    if (savedY) {
      setRestoreY(parseInt(savedY, 10));
    }
  }, []);

  // ✅ 検索結果が出たあとに scrollY を復元（確実に描画後）
  useEffect(() => {
    if (stores.length > 0 && restoreY !== null) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          console.log("🔁 scrollY 復元:", restoreY);
          window.scrollTo({ top: restoreY, behavior: "auto" });
          sessionStorage.removeItem("scrollY");
          setRestoreY(null);
        }, 0);
      });
    }
  }, [stores, restoreY]);

  // ✅ 店舗クリック時に scrollY を保存して遷移
  const handleStoreClick = (storeId: string) => {
    const currentY = window.scrollY;
    console.log("💾 scrollY 保存: ", currentY);
    sessionStorage.setItem("scrollY", currentY.toString());
    router.push(`/stores/${storeId}?prev=/search&${queryParams}`);
  };

  return (
    <div className="w-full bg-[#FEFCF6] pb-8">
      <div className="mx-auto w-full max-w-[600px] px-4">
        {!isSearchTriggered ? (
          <p className="text-gray-400 text-center px-4 pt-6">
            🔍 検索条件を選んで「検索」ボタンを押してください
          </p>
        ) : loading ? (
          <p className="mt-6 mb-4 text-center">ロード中...</p>
        ) : error ? (
          <p className="mt-6 text-red-500 text-center mb-4 px-4">
            ⚠️ エラーが発生しました: {error}
          </p>
        ) : stores.length === 0 ? (
          <p className="text-gray-400 mt-6 text-center mb-4 px-4">
            該当する店舗がありません。
          </p>
        ) : (
          <div>
            <p className="text-lg font-semibold mb-6 text-center py-5 text-gray-700">
              検索結果 <span className="text-[#4B5C9E]">{stores.length}</span> 件
            </p>
            {stores.map((store, index) => {
              const { isOpen, nextOpening } = checkIfOpen(store.opening_hours);
              return (
                <div
                  key={store.id}
                  className="bg-[#FEFCF6] rounded-xl cursor-pointer"
                  onClick={() => handleStoreClick(store.id)}
                >
                  <div className="space-y-3 pt-4">
                    <h3 className="text-[16px] font-bold text-[#1F1F21] leading-snug">
                      {store.name}
                    </h3>
                    <p className="text-[12px] text-[#000000] leading-relaxed text-left">
                      {store.description ?? "店舗説明がありません。"}
                    </p>
                    <div className="flex gap-4 items-center">
                      <div className="w-[160px] h-[90px] border-2 border-black rounded-[8px]">
                        <img
                          src={store.image_url ?? "/default-image.jpg"}
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left space-y-1 text-[14px] text-[#1F1F21]">
                        <p>{store.area} / {store.genre}</p>
                        <p className={`font-semibold ${isOpen ? "text-green-600" : "text-red-500"}`}>
                          {isOpen ? "営業中" : "営業時間外"}
                        </p>
                        <p className="text-xs text-[#1F1F21]">{nextOpening}</p>
                      </div>
                    </div>
                  </div>
                  {index !== stores.length - 1 && (
                    <hr className="mt-6 border-t border-gray-300 w-full" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}