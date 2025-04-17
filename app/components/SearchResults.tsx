"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { checkIfOpen, logAction } from "@/lib/utils";
import { Store } from "../../types";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import type { Messages } from "@/types/messages";

type SearchResultsProps = {
  selectedGenres: string[];
  selectedAreas: string[];
  selectedPayments: string[];
  showOnlyOpen: boolean;
  isSearchTriggered: boolean;
  messages: Messages["searchResults"] & { openUntil?: string };
};

type TranslatedStore = Store & {
  areaTranslated?: string;
  genreTranslated?: string;
};

const fetchStores = async (
  selectedGenres: string[],
  selectedAreas: string[],
  selectedPayments: string[],
  showOnlyOpen: boolean,
  locale: string
): Promise<TranslatedStore[]> => {
  let query = supabase.from("stores").select("*").eq("is_published", true);
  if (selectedGenres.length > 0) query = query.in("genre_id", selectedGenres);
  if (selectedAreas.length > 0) query = query.in("area_id", selectedAreas);
  if (selectedPayments.length > 0) query = query.overlaps("payment_method_ids", selectedPayments);

  const { data: stores, error } = await query;
  if (error || !stores) throw new Error(error?.message || "データ取得に失敗しました");

  const [{ data: areaData }, { data: genreData }] = await Promise.all([
    supabase.from("area_translations").select("area_id, name").eq("locale", locale),
    supabase.from("genre_translations").select("genre_id, name").eq("locale", locale)
  ]);

  const areaMap = Object.fromEntries(areaData?.map((a) => [a.area_id, a.name]) || []);
  const genreMap = Object.fromEntries(genreData?.map((g) => [g.genre_id, g.name]) || []);

  const result = stores.map((store) => ({
    ...store,
    areaTranslated: areaMap[store.area_id],
    genreTranslated: genreMap[store.genre_id]
  }));

  return showOnlyOpen ? result.filter((s) => checkIfOpen(s.opening_hours).isOpen) : result;
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
  const { locale } = useParams() as { locale: string };
  const queryParams = searchParams.toString();
  const [restoreY, setRestoreY] = useState<number | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const { data: stores, error, isLoading } = useSWR<TranslatedStore[]>(
    isSearchTriggered ? ["search-stores", locale] : null,
    () => fetchStores(selectedGenres, selectedAreas, selectedPayments, showOnlyOpen, locale),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    const savedY = sessionStorage.getItem("searchScrollY");
    if (savedY && pathname === `/${locale}/search`) {
      setRestoreY(parseInt(savedY, 10));
    }
  }, [pathname, locale]);

  useEffect(() => {
    if (stores && stores.length > 0 && restoreY !== null) {
      let count = 0;
      const interval = setInterval(() => {
        const h = document.body.scrollHeight;
        if (h >= restoreY || count > 40) {
          clearInterval(interval);
          requestAnimationFrame(() => {
            window.scrollTo({ top: restoreY, behavior: "auto" });
            sessionStorage.removeItem("searchScrollY");
            setRestoreY(null);
          });
        }
        count++;
      }, 100);
    }
  }, [stores, restoreY]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsScrolling(false), 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStoreClick = async (storeId: string) => {
    const currentY = window.scrollY;
    sessionStorage.setItem("searchScrollY", currentY.toString());
    setIsOverlayVisible(true);

    try {
      await logAction("click_search_store", {
        store_id: storeId,
        referrer_page: pathname,
        query_params: queryParams,
      });
    } catch (error) {
      console.error("🔥 アクションログ保存失敗:", error);
    }

    setTimeout(() => {
      router.push(`/${locale}/stores/${storeId}?prev=/search&${queryParams}`);
    }, 100);
  };

  if (!isSearchTriggered) {
    return (
      <div className="w-full bg-[#FEFCF6] pb-8">
        <div className="mx-auto w-full max-w-[600px] px-4">
          <p className="text-gray-400 text-center px-4 pt-6">{messages.prompt}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full bg-[#FEFCF6] pb-8">
        <div className="mx-auto w-full max-w-[600px] px-4">
          <p className="mt-6 mb-4 text-center">{messages.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#FEFCF6] pb-8">
        <div className="mx-auto w-full max-w-[600px] px-4">
          <p className="mt-6 text-red-500 text-center mb-4 px-4">
            ⚠️ {messages.error}: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <div className="w-full bg-[#FEFCF6] pb-8">
        <div className="mx-auto w-full max-w-[600px] px-4">
          <p className="text-gray-400 mt-6 text-center mb-4 px-4">{messages.notFound}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#FEFCF6] pb-8">
      {isOverlayVisible && <div className="fixed inset-0 z-[9999] bg-white/80" />}
      <div className="mx-auto w-full max-w-[600px] px-4">
        <p className="text-lg font-semibold mb-6 text-center py-5 text-gray-700">
          {messages.resultLabel} <span className="text-[#4B5C9E]">{stores.length}</span> {messages.items}
        </p>
        {stores.map((store, index) => {
          const { isOpen, nextOpening, closeTime } = checkIfOpen(store.opening_hours);
          return (
            <div
              key={store.id}
              className={`bg-[#FEFCF6] rounded-xl cursor-pointer ${!isScrolling ? "hover:bg-gray-100 active:bg-gray-200" : ""} transition-colors duration-200`}
              onClick={() => handleStoreClick(store.id)}
            >
              <div className="space-y-3 pt-4">
                <h3 className="text-[16px] font-bold text-[#1F1F21] leading-snug">{store.name}</h3>
                {locale === "ja" && (
                  <p className="text-[12px] text-[#000000] leading-relaxed text-left">
                    {store.description ?? messages.noDescription}
                  </p>
                )}
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
                  <div className="flex flex-col gap-1 flex-1 text-[14px] text-[#1F1F21]">
                    <p>{store.areaTranslated} / {store.genreTranslated}</p>
                    <p className={`font-semibold ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
                      {isOpen ? messages.open : messages.closed}
                    </p>
                    {isOpen && closeTime && (
                      <p className="text-xs text-zinc-700">
                        {messages.openUntil?.replace("{time}", closeTime)}
                      </p>
                    )}
                    {!isOpen && nextOpening && (
                      <p className="text-xs text-zinc-700">
                        {messages.nextOpen
                          .replace('{day}', messages.days[nextOpening.day as keyof typeof messages.days] ?? nextOpening.day)
                          .replace('{time}', nextOpening.time)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {index !== stores.length - 1 && <hr className="mt-6 border-t border-gray-300 w-full" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
