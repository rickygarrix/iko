"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { checkIfOpen, logAction } from "@/lib/utils";
import { useRouter, usePathname, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Messages } from "@/types/messages";

// 🔄 UI表示用に翻訳されたジャンル・エリアを取得する
const useTranslatedNames = (locale: string) => {
  const [genreMap, setGenreMap] = useState<Record<string, string>>({});
  const [areaMap, setAreaMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTranslations = async () => {
      const [{ data: genres }, { data: areas }] = await Promise.all([
        supabase.from("genre_translations").select("genre_id, name").eq("locale", locale),
        supabase.from("area_translations").select("area_id, name").eq("locale", locale),
      ]);

      if (genres) {
        const gMap: Record<string, string> = {};
        genres.forEach((g) => {
          gMap[g.genre_id] = g.name;
        });
        setGenreMap(gMap);
      }

      if (areas) {
        const aMap: Record<string, string> = {};
        areas.forEach((a) => {
          aMap[a.area_id] = a.name;
        });
        setAreaMap(aMap);
      }
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
  is_recommended?: boolean;
  store_instagrams?: string | null;
};

type OpeningInfo = {
  isOpen: boolean;
  nextOpening: {
    day: string;
    time: string;
  } | null;
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
  const { locale } = useParams() as { locale: string };

  const { genreMap, areaMap } = useTranslatedNames(locale);

  useEffect(() => {
    const fetchStores = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("is_published", true)
        .eq("is_recommended", true)
        .limit(3);

      if (error) {
        console.error("🔥 Supabase Error:", error.message);
      } else {
        setStores(data || []);
      }
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
    if (!document.getElementById("instagram-embed-script")) {
      const script = document.createElement("script");
      script.id = "instagram-embed-script";
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      window.instgrm?.Embeds.process();
    }
  }, [stores]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = async (storeId: string) => {
    if (pathname === `/${locale}`) {
      const currentY = window.scrollY;
      sessionStorage.setItem("recommendedScrollY", currentY.toString());
    }

    setIsLoading(true);

    try {
      await logAction("click_recommended_store", {
        store_id: storeId,
      });
    } catch (error) {
      console.error("🔥 アクションログ保存失敗:", error);
    }

    router.push(`/${locale}/stores/${storeId}`);
  };

  return (
    <div className="w-full bg-white flex justify-center pt-8 relative">
      {isLoading && <div className="fixed inset-0 z-[9999] bg-white/80" />}
      <div className="w-full max-w-[600px] flex flex-col mx-auto gap-2">
        {/* 見出し */}
        <div className="w-full px-4 flex flex-col justify-start items-center gap-1">
          <div className="text-center text-zinc-900 text-lg font-bold leading-relaxed tracking-widest">
            {messages.title}
          </div>
          <div className="text-center text-slate-500 text-xs font-bold leading-none tracking-wide">
            {messages.subtitle}
          </div>
        </div>

        {/* リスト */}
        {!storesReady ? (
          <div style={{ height: "100vh" }} />
        ) : (
          <div className="w-full flex flex-col justify-start items-center gap-px">
            {stores.map((store, index) => {
              const { isOpen, nextOpening } = checkIfOpen(store.opening_hours) as OpeningInfo;
              return (
                <motion.div
                  key={store.id}
                  onClick={() => handleClick(store.id)}
                  className={`w-full px-4 py-4 bg-white flex flex-col gap-4 border-b last:border-b-0 cursor-pointer ${!isScrolling ? "hover:bg-gray-100 active:bg-gray-200" : ""} transition-colors duration-200`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* 店舗名と説明 */}
                  <div className="flex flex-col gap-2">
                    <div className="text-zinc-900 text-base font-semibold leading-normal">
                      {store.name}
                    </div>
                    <div className="text-zinc-900 text-xs font-light leading-normal line-clamp-2">
                      {store.description || messages.noDescription}
                    </div>
                  </div>

                  {/* 画像＋店舗情報 */}
                  <div className="flex gap-4 items-start">
                    <div className="relative w-32 h-56 rounded-lg overflow-hidden outline outline-2 outline-zinc-900 flex-shrink-0">
                      {store.store_instagrams ? (
                        <blockquote
                          className="instagram-media"
                          data-instgrm-permalink={store.store_instagrams}
                          data-instgrm-version="14"
                          style={{
                            width: "100%",
                            height: "100%",
                            margin: 0,
                            transform: "scale(0.75)",
                            transformOrigin: "top left",
                            overflow: "hidden",
                          }}
                        ></blockquote>
                      ) : (
                        <Image
                          src={store.image_url || "/default-image.jpg"}
                          alt={store.name}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="160px"
                          unoptimized
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                      <div className="text-zinc-900 text-sm font-light">
                        {areaMap[store.area_id] || store.area_id} / {genreMap[store.genre_id] || store.genre_id}
                      </div>
                      <div className="text-sm font-light">
                        <span className={isOpen ? "text-green-700" : "text-rose-700"}>
                          {isOpen ? messages.open : messages.closed}
                        </span>
                      </div>
                      {nextOpening && (
                        <div className="text-sm font-light text-zinc-700">
                          {messages.nextOpen
                            .replace(
                              "{day}",
                              messages.days[nextOpening.day as keyof typeof messages.days] ?? nextOpening.day
                            )
                            .replace("{time}", nextOpening.time)}
                        </div>
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