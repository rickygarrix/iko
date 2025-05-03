"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { translateText } from "@/lib/translateText";
import { useRouter, usePathname } from "next/navigation";
import { logAction } from "@/lib/utils";
import type { Messages } from "@/types/messages";
import StoreCard from "@/components/StoreCard";
import { sendGAEvent } from "@/lib/ga";

type Store = {
  id: string;
  name: string;
  genre_ids: string[];
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
  const [translatedDescriptions, setTranslatedDescriptions] = useState<Record<string, string>>({});
  const [genreMap, setGenreMap] = useState<Record<string, string>>({});
  const [areaMap, setAreaMap] = useState<Record<string, string>>({});
  const [restoreY, setRestoreY] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [storesReady, setStoresReady] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ja";

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: stores }, { data: genres }, { data: areas }] = await Promise.all([
        supabase.from("stores").select("*").eq("is_published", true).eq("is_recommended", true).limit(3),
        supabase.from("genre_translations").select("genre_id, name").eq("locale", locale),
        supabase.from("area_translations").select("area_id, name").eq("locale", locale),
      ]);
      if (stores) setStores(stores);
      if (genres) setGenreMap(Object.fromEntries(genres.map((g) => [g.genre_id, g.name])));
      if (areas) setAreaMap(Object.fromEntries(areas.map((a) => [a.area_id, a.name])));
    };
    fetchAll();
  }, [locale]);

  useEffect(() => {
    if (locale === "ja") return;
    const translateAll = async () => {
      const result: Record<string, string> = {};
      for (const store of stores) {
        if (store.description) {
          try {
            const translated = await translateText(store.description, locale);
            result[store.id] = translated;
          } catch {
            result[store.id] = store.description;
          }
        }
      }
      setTranslatedDescriptions(result);
    };
    translateAll();
  }, [stores, locale]);

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

  const handleClick = async (storeId: string) => {
    if (locale !== "ja") return;
    if (pathname === `/${locale}`) {
      sessionStorage.setItem("recommendedScrollY", window.scrollY.toString());
    }
    setIsLoading(true);
    try {
      await logAction("click_recommended_store", { store_id: storeId, locale });
    } catch (e) {
      console.error("🔥 ログ保存失敗:", e);
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
          <div className="w-full flex flex-col items-center gap-4 px-4">
            {stores.map((store, idx) => (
              <StoreCard
                key={store.id}
                store={{
                  ...store,
                  areaTranslated: areaMap[store.area_id],
                }}
                locale={locale}
                index={idx}
                genresMap={genreMap}
                translatedDescription={translatedDescriptions[store.id]}
                messages={messages}
                delay={idx * 0.05}
                onClick={() => handleClick(store.id)}
                onMapClick={(e) => {
                  e.stopPropagation();
                  sendGAEvent("click_recommend_map", {
                    store_id: store.id,
                    store_name: store.name,
                    latitude: store.latitude ?? undefined,
                    longitude: store.longitude ?? undefined,
                  });
                }}
                mapClickEventName="click_recommend_map"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}