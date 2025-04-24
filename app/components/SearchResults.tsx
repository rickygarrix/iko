"use client";

import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { checkIfOpen, logAction } from "@/lib/utils";
import { Store } from "../../types";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Messages } from "@/types/messages";

type SearchResultsProps = {
  selectedGenres: string[];
  selectedAreas: string[];
  selectedPayments: string[];
  showOnlyOpen: boolean;
  isSearchTriggered: boolean;
  messages: Messages["searchResults"] & { openUntil?: string; close?: string };
};

type TranslatedStore = Store & {
  areaTranslated?: string;
  genreTranslated?: string;
};

const convertToAMPM = (time24: string): string => {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
};

const formatCloseTime = (time: string, locale: string, messages: SearchResultsProps["messages"]) => {
  const formatted = locale === "en" ? convertToAMPM(time) : time;
  switch (locale) {
    case "zh":
      return `${formatted} ${messages.close}`;
    case "ko":
      return `${formatted}${messages.close}`;
    case "en":
      return messages.openUntil?.replace("{time}", formatted);
    default:
      return messages.openUntil?.replace("{time}", formatted);
  }
};

const formatNextOpening = (
  nextOpening: { day: string; time: string },
  locale: string,
  messages: SearchResultsProps["messages"]
) => {
  const formatted = locale === "en" ? convertToAMPM(nextOpening.time) : nextOpening.time;
  const day = messages.days[nextOpening.day as keyof typeof messages.days] || nextOpening.day;
  return messages.nextOpen.replace("{day}", day).replace("{time}", formatted);
};

const fetchStores = async (
  selectedGenres: string[],
  selectedAreas: string[],
  selectedPayments: string[],
  showOnlyOpen: boolean,
  locale: string
): Promise<TranslatedStore[]> => {
  let query = supabase.from("stores").select("*").eq("is_published", true);
  if (selectedGenres.length) query = query.in("genre_id", selectedGenres);
  if (selectedAreas.length) query = query.in("area_id", selectedAreas);
  if (selectedPayments.length) query = query.overlaps("payment_method_ids", selectedPayments);

  const { data: stores, error } = await query;
  if (error || !stores) throw new Error(error?.message || "データ取得に失敗しました");

  const [{ data: areaData }, { data: genreData }] = await Promise.all([
    supabase.from("area_translations").select("area_id, name").eq("locale", locale),
    supabase.from("genre_translations").select("genre_id, name").eq("locale", locale),
  ]);

  const areaMap = Object.fromEntries(areaData?.map((a) => [a.area_id, a.name]) || []);
  const genreMap = Object.fromEntries(genreData?.map((g) => [g.genre_id, g.name]) || []);

  const result = stores.map((store) => ({
    ...store,
    areaTranslated: areaMap[store.area_id],
    genreTranslated: genreMap[store.genre_id],
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
  const queryParams = searchParams.toString();

  const locale = pathname.split("/")[1] || "ja";
  const [restoreY, setRestoreY] = useState<number | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const clickedStoreIds = useRef<Set<string>>(new Set());

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
        if (document.body.scrollHeight >= restoreY || count > 40) {
          clearInterval(interval);
          window.scrollTo({ top: restoreY, behavior: "auto" });
          sessionStorage.removeItem("searchScrollY");
          setRestoreY(null);
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
    if (locale !== "ja") return;
    if (clickedStoreIds.current.has(storeId)) return;
    clickedStoreIds.current.add(storeId);

    sessionStorage.setItem("searchScrollY", window.scrollY.toString());
    setIsOverlayVisible(true);

    try {
      await logAction("click_search_store", {
        store_id: storeId,
        query_params: queryParams,
        locale,
      });
    } catch {
      /* ignore */
    }

    setTimeout(() => {
      router.push(`/stores/${storeId}?prev=/search&${queryParams}`);
    }, 100);
  };

  if (!isSearchTriggered) {
    return (
      <div className="w-full bg-[#FEFCF6] pb-8">
        <div className="mx-auto max-w-[600px] px-4">
          <p className="text-gray-400 text-center pt-6">{messages.prompt}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full bg-[#FEFCF6] pb-8">
        <div className="mx-auto max-w-[600px] px-4">
          <p className="text-center py-6">{messages.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#FEFCF6] pb-8">
        <div className="mx-auto max-w-[600px] px-4">
          <p className="text-red-500 text-center py-6">
            ⚠️ {messages.error}: {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <div className="w-full bg-[#FEFCF6] pb-8">
        <div className="mx-auto max-w-[600px] px-4">
          <p className="text-gray-400 text-center py-6">{messages.notFound}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#FEFCF6] pb-8">
      {isOverlayVisible && <div className="fixed inset-0 z-[9999] bg-white/80" />}
      <div className="mx-auto max-w-[600px] px-4">
        <p className="text-lg font-semibold text-center py-5 text-gray-700">
          {messages.resultLabel} <span className="text-[#4B5C9E]">{stores.length}</span> {messages.items}
        </p>
        {stores.map((store, idx) => {
          const { isOpen, nextOpening, closeTime } = checkIfOpen(store.opening_hours);
          return (
            <div
              key={store.id}
              onClick={() => handleStoreClick(store.id)}
              className={`bg-[#FEFCF6] rounded-xl ${locale === "ja" ? `cursor-pointer ${!isScrolling ? "hover:bg-gray-100 active:bg-gray-200" : ""}` : "cursor-default"} transition-colors duration-200`}
            >
              <div className="space-y-3 pt-4">
                <h3 className="text-base font-bold text-[#1F1F21]">{store.name}</h3>
                {locale === "ja" && (
                  <p className="text-xs text-[#1F1F21] leading-relaxed line-clamp-2">
                    {store.description ?? messages.noDescription}
                  </p>
                )}
                <div className="flex gap-4 items-center">
                  <div className="w-[160px] h-[90px] border-2 border-black rounded-[8px] overflow-hidden">
                    {/* 画像表示など省略 */}
                  </div>
                  <div className="flex-1 text-sm text-[#1F1F21]">
                    <p>
                      {store.areaTranslated} / {store.genreTranslated}
                    </p>
                    <p className={`font-semibold ${isOpen ? "text-green-600" : "text-red-500"}`}>
                      {isOpen ? messages.open : messages.closed}
                    </p>
                    {isOpen && closeTime && (
                      <p className="text-xs text-zinc-700">
                        {formatCloseTime(closeTime, locale, messages)}
                      </p>
                    )}
                    {!isOpen && nextOpening && (
                      <p className="text-xs text-zinc-700">
                        {formatNextOpening(nextOpening, locale, messages)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {idx < stores.length - 1 && <hr className="mt-6 border-gray-300" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}