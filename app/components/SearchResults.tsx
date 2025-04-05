"use client";

import { useState } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { checkIfOpen } from "@/lib/utils";
import { Store } from "../../types";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion"; // ←追加！

type SearchResultsProps = {
  selectedGenres: string[];
  selectedAreas: string[];
  selectedPayments: string[];
  showOnlyOpen: boolean;
  isSearchTriggered: boolean;
};

// --- データ取得 ---
const fetchStores = async (
  selectedGenres: string[],
  selectedAreas: string[],
  selectedPayments: string[],
  showOnlyOpen: boolean
): Promise<Store[]> => {
  let query = supabase.from("stores").select("*");

  if (selectedGenres.length > 0) query = query.in("genre", selectedGenres);
  if (selectedAreas.length > 0) query = query.in("area", selectedAreas);
  if (selectedPayments.length > 0) query = query.overlaps("payment_methods", selectedPayments);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return showOnlyOpen
    ? (data || []).filter((store) => checkIfOpen(store.opening_hours).isOpen)
    : (data || []);
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

  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const { data: stores, error, isLoading } = useSWR<Store[]>(
    isSearchTriggered ? "search-stores" : null,
    () => fetchStores(selectedGenres, selectedAreas, selectedPayments, showOnlyOpen),
    { revalidateOnFocus: false }
  );

  const handleStoreClick = (storeId: string) => {
    setIsOverlayVisible(true);
    setTimeout(() => {
      router.push(`/stores/${storeId}?prev=/search&${queryParams}`);
    }, 100);
  };

  if (!isSearchTriggered) {
    return (
      <div className="w-full bg-[#FEFCF6] pb-8">
        <div className="mx-auto w-full max-w-[600px] px-4">
          <p className="text-gray-400 text-center px-4 pt-6">
            🔍 検索条件を選んで「検索」ボタンを押してください
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full bg-[#FEFCF6] pb-8">
        <div className="mx-auto w-full max-w-[600px] px-4">
          <p className="mt-6 mb-4 text-center">ロード中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#FEFCF6] pb-8">
        <div className="mx-auto w-full max-w-[600px] px-4">
          <p className="mt-6 text-red-500 text-center mb-4 px-4">
            ⚠️ エラーが発生しました: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <div className="w-full bg-[#FEFCF6] pb-8">
        <div className="mx-auto w-full max-w-[600px] px-4">
          <p className="text-gray-400 mt-6 text-center mb-4 px-4">
            該当する店舗がありません。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#FEFCF6] pb-8">
      {/* オーバーレイ */}
      {isOverlayVisible && (
        <div className="fixed inset-0 z-[9999] bg-white/80"></div>
      )}

      <div className="mx-auto w-full max-w-[600px] px-4">
        <p className="text-lg font-semibold mb-6 text-center py-5 text-gray-700">
          検索結果 <span className="text-[#4B5C9E]">{stores.length}</span> 件
        </p>

        {stores.map((store: Store, index: number) => {
          const { isOpen, nextOpening } = checkIfOpen(store.opening_hours);

          return (
            <motion.div
              key={store.id}
              onClick={() => handleStoreClick(store.id)}
              className="bg-[#FEFCF6] rounded-xl cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }} // ← フェードイン間隔ずらしてる✨
            >
              <div className="space-y-3 pt-4">
                <h3 className="text-[16px] font-bold text-[#1F1F21] leading-snug">
                  {store.name}
                </h3>
                <p className="text-[12px] text-[#000000] leading-relaxed text-left">
                  {store.description ?? "店舗説明がありません。"}
                </p>
                <div className="flex gap-4 items-center">
                  <div className="w-[160px] h-[90px] border-2 border-black rounded-[8px] overflow-hidden">
                    <Image
                      src={store.image_url ?? "/default-image.jpg"}
                      alt={store.name}
                      width={160}
                      height={90}
                      className="w-full h-full object-cover"
                      unoptimized
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}