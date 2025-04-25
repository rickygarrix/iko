"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { checkIfOpen, logAction } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Messages } from "@/types/messages";

const convertToAMPM = (time24: string): string => {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
};

const formatCloseTime = (time: string, locale: string, messages: Messages["recommend"]) => {
  const formatted = locale === "en" ? convertToAMPM(time) : time;
  return messages.openUntil.replace("{time}", formatted);
};

const formatNextOpening = (
  nextOpening: { day: string; time: string },
  locale: string,
  messages: Messages["recommend"]
) => {
  const formatted = locale === "en" ? convertToAMPM(nextOpening.time) : nextOpening.time;
  const day = messages.days[nextOpening.day as keyof typeof messages.days] || nextOpening.day;
  return messages.nextOpen.replace("{day}", day).replace("{time}", formatted);
};

const useTranslatedNames = (locale: string) => {
  const [genreMap, setGenreMap] = useState<Record<string, string>>({});
  const [areaMap, setAreaMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTranslations = async () => {
      const [{ data: genres }, { data: areas }] = await Promise.all([
        supabase.from("genre_translations").select("genre_id, name").eq("locale", locale),
        supabase.from("area_translations").select("area_id, name").eq("locale", locale),
      ]);
      const gMap: Record<string, string> = {};
      genres?.forEach((g) => (gMap[g.genre_id] = g.name));
      const aMap: Record<string, string> = {};
      areas?.forEach((a) => (aMap[a.area_id] = a.name));
      setGenreMap(gMap);
      setAreaMap(aMap);
    };
    fetchTranslations();
  }, [locale]);

  return { genreMap, areaMap };
};

type Store = {
  id: string;
  name: string;
  genre_id: string;
  area_id: string;
  opening_hours: string;
  image_url?: string | null;
  description?: string;
  latitude: number | null;
  longitude: number | null;
};

type Props = {
  messages: Messages["recommend"];
};

export default function RecommendedStores({ messages }: Props) {
  const [stores, setStores] = useState<Store[]>([]);
  const [restoreY, setRestoreY] = useState<number | null>(null);
  const [storesReady, setStoresReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ja";
  const { genreMap, areaMap } = useTranslatedNames(locale);

  useEffect(() => {
    const fetchStores = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("is_published", true)
        .eq("is_recommended", true)
        .limit(3);
      if (error) console.error("🔥 Supabase Error:", error.message);
      else setStores(data || []);
    };
    fetchStores();
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("recommendedScrollY");
    if (saved && pathname === `/${locale}`) {
      setRestoreY(parseInt(saved, 10));
    }
  }, [pathname, locale]);

  useEffect(() => {
    if (restoreY !== null && stores.length > 0) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.scrollTo({ top: restoreY, behavior: "auto" });
          sessionStorage.removeItem("recommendedScrollY");
          setRestoreY(null);
          setStoresReady(true);
        }, 0);
      });
    } else if (stores.length > 0) {
      setStoresReady(true);
    }
  }, [restoreY, stores]);

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

  const handleClick = async (storeId: string) => {
    if (locale !== "ja") return;
    if (pathname === `/${locale}`) {
      sessionStorage.setItem("recommendedScrollY", window.scrollY.toString());
    }
    setIsLoading(true);
    try {
      await logAction("click_recommended_store", { store_id: storeId, locale });
    } catch (e) {
      console.error("🔥 アクションログ保存失敗:", e);
    }
    router.push(`/stores/${storeId}`);
  };

  return (
    <div className="w-full bg-white flex justify-center pt-8 relative">
      {isLoading && <div className="fixed inset-0 z-[9999] bg-white/80" />}
      <div className="w-full max-w-[600px] flex flex-col mx-auto gap-2">
        <div className="w-full px-4 flex flex-col items-center gap-1">
          <h2 className="text-lg font-bold text-zinc-900">{messages.title}</h2>
          <p className="text-xs text-slate-500 font-bold">{messages.subtitle}</p>
        </div>

        {!storesReady ? (
          <div style={{ height: "100vh" }} />
        ) : (
          <div className="w-full flex flex-col items-center gap-px">
            {stores.map((store, idx) => {
              const { isOpen, nextOpening, closeTime } = checkIfOpen(store.opening_hours);

              const interactiveClasses =
                locale === "ja"
                  ? `cursor-pointer ${!isScrolling ? "hover:bg-gray-100 active:bg-gray-200" : ""}`
                  : "cursor-default";

              const staticMapUrl =
                store.latitude !== null && store.longitude !== null
                  ? `https://maps.googleapis.com/maps/api/staticmap?center=${store.latitude},${store.longitude}&zoom=16&size=160x90&scale=2&maptype=roadmap&markers=color:red%7C${store.latitude},${store.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
                  : null;

              return (
                <motion.div
                  key={store.id}
                  onClick={() => handleClick(store.id)}
                  className={`w-full px-4 py-4 bg-white flex flex-col gap-4 border-b last:border-b-0 transition-colors duration-200 ${interactiveClasses}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold text-zinc-900">{store.name}</h3>
                    {locale === "ja" && (
                      <p className="text-xs font-light text-zinc-900 line-clamp-2">
                        {store.description || messages.noDescription}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4 items-start">
                    <a
                      href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-[160px] h-[90px] rounded-[8px] overflow-hidden outline outline-2 outline-zinc-900 block"
                      onClick={(e) => e.stopPropagation()} // ← motion.divのクリックと分離
                    >
                      <Image
                        src={staticMapUrl || store.image_url || "/default-image.jpg"}
                        alt={store.name}
                        width={160}
                        height={90}
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    </a>

                    <div className="flex flex-col gap-2 flex-1 text-sm">
                      <p className="text-zinc-900">
                        {areaMap[store.area_id] || store.area_id} / {genreMap[store.genre_id] || store.genre_id}
                      </p>
                      <p className={`font-semibold ${isOpen ? "text-green-700" : "text-rose-700"}`}>
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
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}