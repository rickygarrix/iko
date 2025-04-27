"use client";

import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { checkIfOpen, logAction } from "@/lib/utils";
import { Store } from "../../types";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
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
  latitude?: number | null;
  longitude?: number | null;
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
    case "zh": return `${formatted} ${messages.close}`;
    case "ko": return `${formatted}${messages.close}`;
    case "en": return messages.openUntil?.replace("{time}", formatted);
    default: return messages.openUntil?.replace("{time}", formatted);
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

  return (showOnlyOpen ? stores.filter((s) => checkIfOpen(s.opening_hours).isOpen) : stores).map((store) => ({
    ...store,
    areaTranslated: areaMap[store.area_id],
    genreTranslated: genreMap[store.genre_id],
  }));
};

export default function SearchResults({ selectedGenres, selectedAreas, selectedPayments, showOnlyOpen, isSearchTriggered, messages }: SearchResultsProps) {
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
    if (savedY && pathname === `/${locale}/search`) setRestoreY(parseInt(savedY, 10));
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
    if (locale !== "ja" || clickedStoreIds.current.has(storeId)) return;
    clickedStoreIds.current.add(storeId);

    sessionStorage.setItem("searchScrollY", window.scrollY.toString());
    setIsOverlayVisible(true);

    try {
      await logAction("click_search_store", {
        store_id: storeId,
        query_params: queryParams,
        locale,
      });
    } catch { }

    setTimeout(() => {
      router.push(`/stores/${storeId}?prev=/search&${queryParams}`);
    }, 100);
  };

  if (!isSearchTriggered) return <p className="text-center py-6">{messages.prompt}</p>;
  if (isLoading) return <p className="text-center py-6">{messages.loading}</p>;
  if (error) return <p className="text-red-500 text-center py-6">⚠️ {messages.error}: {(error as Error).message}</p>;
  if (!stores || stores.length === 0) return <p className="text-center py-6">{messages.notFound}</p>;

  return (
    <div className="relative w-full  pb-8 "> {/* ← ここで全幅白背景にする */}
      {isOverlayVisible && <div className="fixed inset-0 z-[9999] bg-white/80" />}
      <div className="mx-auto max-w-[600px] px-4">
        <p className="text-lg font-semibold text-center py-5 text-gray-700">
          {messages.resultLabel} <span className="text-[#4B5C9E]">{stores.length}</span> {messages.items}
        </p>


        <div className="flex flex-col items-center gap-4">
          {stores.map((store,) => {
            const { isOpen, nextOpening, closeTime } = checkIfOpen(store.opening_hours);
            const staticMapUrl =
              store.latitude !== null && store.longitude !== null
                ? `https://maps.googleapis.com/maps/api/staticmap?center=${store.latitude},${store.longitude}&zoom=16&size=100x165&scale=2&maptype=roadmap&markers=color:red%7C${store.latitude},${store.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
                : null;

            return (
              <div
                key={store.id}
                onClick={() => handleStoreClick(store.id)}
                className={`w-full max-w-[390px] p-4 bg-white flex flex-row gap-4 rounded transition-colors duration-200 ${locale === "ja" ? `cursor-pointer ${!isScrolling ? "hover:bg-gray-100 active:bg-gray-200" : ""}` : "cursor-default"}`}
              >
                {/* 左側：店舗情報 */}
                <div className="flex flex-col flex-1 gap-2">
                  <h3 className="text-base font-bold text-[#1F1F21]">{store.name}</h3>

                  {locale === "ja" && (
                    <p className="text-xs font-light text-[#1F1F21] line-clamp-2">
                      {store.description ?? messages.noDescription}
                    </p>
                  )}

                  <p className="text-xs text-[#1F1F21]">
                    {store.areaTranslated} / {store.genreTranslated}
                  </p>

                  {/* ✅ 営業中・営業時間を改行して表示 */}
                  <div className="flex flex-col text-xs">
                    <span className={`font-bold ${isOpen ? "text-green-700" : "text-rose-700"}`}>
                      {isOpen ? messages.open : messages.closed}
                    </span>
                    <span className="text-zinc-700">
                      {isOpen && closeTime
                        ? formatCloseTime(closeTime, locale, messages)
                        : nextOpening
                          ? formatNextOpening(nextOpening, locale, messages)
                          : ""}
                    </span>
                  </div>
                </div>

                {/* 右側：地図 */}
                <a
                  href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-[100px] h-[165px] rounded-[4px] overflow-hidden border-2 border-[#1F1F21] block"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={staticMapUrl || "/default-image.jpg"}
                    alt={store.name}
                    width={100}
                    height={165}
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}