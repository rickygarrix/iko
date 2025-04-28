"use client";

import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { checkIfOpen, logAction } from "@/lib/utils";
import { translateText } from "@/lib/translateText";
import { Store } from "../../types";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Messages } from "@/types/messages";

type SearchResultsProps = {
  selectedGenres: string[];
  selectedAreas: string[];
  selectedPayments: string[];
  showOnlyOpen: boolean;
  isSearchTriggered: boolean;
  messages: Messages["searchResults"] & { genres: Record<string, string> }; // ✅ ここ
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

const formatNextOpening = (nextOpening: { day: string; time: string }, locale: string, messages: SearchResultsProps["messages"]) => {
  const formatted = locale === "en" ? convertToAMPM(nextOpening.time) : nextOpening.time;
  const day = messages.days[nextOpening.day as keyof typeof messages.days] || nextOpening.day;
  return messages.nextOpen.replace("{day}", day).replace("{time}", formatted);
};

const fetchStores = async (selectedGenres: string[], selectedAreas: string[], selectedPayments: string[], showOnlyOpen: boolean, locale: string): Promise<TranslatedStore[]> => {
  let query = supabase.from("stores").select("*").eq("is_published", true);

  if (selectedGenres.length > 0) {
    query = query.filter("genre_ids", "cs", JSON.stringify(selectedGenres));
  }
  if (selectedAreas.length) query = query.in("area_id", selectedAreas);
  if (selectedPayments.length) query = query.overlaps("payment_method_ids", selectedPayments);

  const { data: stores, error } = await query;
  if (error || !stores) throw new Error(error?.message || "データ取得に失敗しました");

  const { data: areaData } = await supabase
    .from("area_translations")
    .select("area_id, name")
    .eq("locale", locale);

  const areaMap = Object.fromEntries(areaData?.map((a) => [a.area_id, a.name]) || []);

  return (showOnlyOpen ? stores.filter((s) => checkIfOpen(s.opening_hours).isOpen) : stores).map((store) => ({
    ...store,
    areaTranslated: areaMap[store.area_id],
  }));
};

export default function SearchResults({ selectedGenres, selectedAreas, selectedPayments, showOnlyOpen, isSearchTriggered, messages }: SearchResultsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryParams = searchParams.toString();
  const locale = pathname.split("/")[1] || "ja";

  const [translatedDescriptions, setTranslatedDescriptions] = useState<Record<string, string>>({});
  const [restoreY, setRestoreY] = useState<number | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
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
    const translateAllDescriptions = async () => {
      if (locale === "ja") return;
      const translations: Record<string, string> = {};
      for (const store of stores || []) {
        if (store.description) {
          try {
            const translated = await translateText(store.description, locale);
            translations[store.id] = translated;
          } catch (err) {
            console.error("翻訳エラー:", err);
            translations[store.id] = store.description;
          }
        }
      }
      setTranslatedDescriptions(translations);
    };
    if (stores) translateAllDescriptions();
  }, [stores, locale]);

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

  if (!isSearchTriggered) return <p className="text-center py-6">{messages.prompt}</p>;
  if (isLoading) return <p className="text-center py-6">{messages.loading}</p>;
  if (error) return <p className="text-red-500 text-center py-6">⚠️ {messages.error}: {(error as Error).message}</p>;
  if (!stores || stores.length === 0) return <p className="text-center py-6">{messages.notFound}</p>;

  return (
    <div className="relative w-full pb-8">
      {isOverlayVisible && <div className="fixed inset-0 z-[9999] bg-white/80" />}
      <div className="mx-auto max-w-[600px] px-4">
        <p className="text-lg font-semibold text-center py-5 text-gray-700">
          {messages.resultLabel} <span className="text-[#4B5C9E]">{stores.length}</span> {messages.items}
        </p>

        <div className="flex flex-col items-center gap-4">
          {stores.map((store, idx) => {
            const { isOpen, nextOpening, closeTime } = checkIfOpen(store.opening_hours);
            const staticMapUrl =
              store.latitude !== null && store.longitude !== null
                ? `https://maps.googleapis.com/maps/api/staticmap?center=${store.latitude},${store.longitude}&zoom=16&size=100x165&scale=2&maptype=roadmap&markers=color:red%7C${store.latitude},${store.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
                : null;

            return (
              <motion.div
                key={store.id}
                onClick={() => handleStoreClick(store.id)}
                className="w-full max-w-[520px] p-5 bg-white flex flex-row gap-5 rounded-lg transition-colors duration-200 cursor-pointer hover:bg-gray-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex flex-col justify-between flex-1">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-bold text-zinc-900">{store.name}</h3>

                    {store.description && (
                      <p className="text-sm font-normal text-zinc-800 leading-snug line-clamp-2">
                        {locale === "ja"
                          ? store.description
                          : translatedDescriptions[store.id] || store.description}
                      </p>
                    )}

                    <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                      {store.areaTranslated}
                      {"\n"}
                      {store.genre_ids?.map((gid: string) => messages.genres[gid] || gid).join(" / ")}
                    </p>

                    <div className="flex flex-col text-sm">
                      <span className={`font-bold ${isOpen ? "text-green-700" : "text-rose-700"}`}>{
                        isOpen ? messages.open : messages.closed
                      }</span>
                      <span className="text-zinc-700">
                        {isOpen && closeTime
                          ? formatCloseTime(closeTime, locale, messages)
                          : nextOpening
                            ? formatNextOpening(nextOpening, locale, messages)
                            : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-[120px] h-[180px] rounded-md overflow-hidden border-2 border-[#1F1F21] block"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={staticMapUrl || "/default-image.jpg"}
                    alt={store.name}
                    width={120}
                    height={180}
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}