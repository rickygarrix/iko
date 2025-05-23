"use client";

import { useLayoutEffect, useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { checkIfOpen, logAction } from "@/lib/utils";
import { translateText } from "@/lib/translateText";
import { Store } from "@/types/store";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import StoreCard from "@/components/StoreCard";
import type { Messages } from "@/types/messages";
import { sendGAEvent } from "@/lib/ga";

export type TranslatedStore = Store & {
  areaTranslated?: string;
};

export type SearchResultsProps = {
  selectedGenres: string[];
  selectedAreas: string[];
  selectedPayments: string[];
  showOnlyOpen: boolean;
  isSearchTriggered: boolean;
  messages: Messages["searchResults"] & { genres: Record<string, string> };
};

const fetchStores = async (
  selectedGenres: string[],
  selectedAreas: string[],
  selectedPayments: string[],
  showOnlyOpen: boolean,
  locale: string
): Promise<TranslatedStore[]> => {
  let query = supabase.from("stores").select("*").eq("is_published", true);

  if (selectedGenres.length) {
    query = query.filter("genre_ids", "cs", JSON.stringify(selectedGenres));
  }
  if (selectedAreas.length) {
    query = query.in("area_id", selectedAreas);
  }
  if (selectedPayments.length) {
    query = query.overlaps("payment_method_ids", selectedPayments);
  }

  const { data: stores, error } = await query;
  if (error || !stores) throw new Error(error?.message || "データ取得に失敗しました");

  const { data: areaData } = await supabase
    .from("area_translations")
    .select("area_id, name")
    .eq("locale", locale);

  const areaMap = Object.fromEntries(areaData?.map((a) => [a.area_id, a.name]) || []);

  return (showOnlyOpen ? stores.filter((s) => checkIfOpen(s.opening_hours).isOpen) : stores).map(
    (store) => ({
      ...store,
      areaTranslated: areaMap[store.area_id],
    })
  );
};

export default function SearchResults({
  selectedGenres,
  selectedAreas,
  selectedPayments,
  showOnlyOpen,
  isSearchTriggered,
  messages,
}: SearchResultsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryParams = searchParams.toString();
  const locale = pathname.split("/")[1] || "ja";

  const [translatedDescriptions, setTranslatedDescriptions] = useState<Record<string, string>>({});
  const [restoreY, setRestoreY] = useState<number | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const clickedStoreIds = useRef<Set<string>>(new Set());

  const { data: stores, error, isLoading } = useSWR<TranslatedStore[]>(
    isSearchTriggered ? ["search-stores", locale] : null,
    () => fetchStores(selectedGenres, selectedAreas, selectedPayments, showOnlyOpen, locale),
    { revalidateOnFocus: false }
  );

  // 🧭 スクロール復元処理（ブラウザバック対策）
  useLayoutEffect(() => {
    const savedY = sessionStorage.getItem("searchScrollY");
    if (savedY && pathname === `/${locale}/search`) {
      const y = parseInt(savedY, 10);
      setIsRestoring(true);
      requestAnimationFrame(() => {
        window.scrollTo(0, y);
        setTimeout(() => {
          window.scrollTo(0, y);
          sessionStorage.removeItem("searchScrollY");
          setRestoreY(null);
          setIsRestoring(false);
          setShouldRender(true);
        }, 0);
      });
    } else {
      setShouldRender(true);
    }
  }, [pathname, locale]);

  // 🌐 翻訳（非日本語時のみ）
  useEffect(() => {
    if (!stores || locale === "ja") return;
    const translateAll = async () => {
      const translations: Record<string, string> = {};
      for (const store of stores) {
        if (store.description) {
          try {
            const translated = await translateText(store.description, locale);
            translations[store.id] = translated;
          } catch {
            translations[store.id] = store.description;
          }
        }
      }
      setTranslatedDescriptions(translations);
    };
    translateAll();
  }, [stores, locale]);

  // ✅ 店舗カードクリック時
  const handleStoreClick = async (storeId: string) => {
    if (locale !== "ja" || clickedStoreIds.current.has(storeId)) return;
    clickedStoreIds.current.add(storeId);
    sessionStorage.setItem("searchScrollY", window.scrollY.toString());
    setIsOverlayVisible(true);
    try {
      await logAction("click_search_store", { store_id: storeId, query_params: queryParams, locale });
    } catch { }
    setTimeout(() => {
      router.push(`/stores/${storeId}?prev=/search&${queryParams}`);
    }, 100);
  };

  // 🔁 各状態
  if (!isSearchTriggered) return <p className="text-center py-6">{messages.prompt}</p>;
  if (isLoading) return <p className="text-center py-6">{messages.loading}</p>;
  if (error) return <p className="text-red-500 text-center py-6">⚠️ {messages.error}: {(error as Error).message}</p>;
  if (!stores || stores.length === 0) return <p className="text-center py-6">{messages.notFound}</p>;

  return (
    <div
      className="relative w-full pb-8"
      style={{
        visibility: isRestoring ? "hidden" : "visible",
        minHeight: "100vh",
      }}
    >
      {isOverlayVisible && <div className="fixed inset-0 z-[9999] bg-white/80" />}
      {shouldRender && (
        <div className="mx-auto max-w-[600px] px-4">
          <p className="text-lg font-semibold text-center py-5 text-gray-700">
            {messages.resultLabel} <span className="text-[#4B5C9E]">{stores.length}</span> {messages.items}
          </p>
          <div className="flex flex-col items-center gap-4">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                locale={locale}
                index={0}
                genresMap={messages.genres}
                translatedDescription={translatedDescriptions[store.id]}
                onClick={handleStoreClick}
                onMapClick={(e) => {
                  e.stopPropagation();
                  sendGAEvent("click_searchresult_map", {
                    store_id: store.id,
                    store_name: store.name,
                    latitude: store.latitude ?? undefined,
                    longitude: store.longitude ?? undefined,
                  });
                }}
                messages={messages}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}