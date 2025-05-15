"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { translateText } from "@/lib/translateText";
import { checkIfOpen, logAction } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
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
  const [scrollRestored, setScrollRestored] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ja";
  const scrollKey = "recommendedScrollY";

  // ① 描画前に scrollTo 実行
  useLayoutEffect(() => {
    const y = sessionStorage.getItem(scrollKey);
    if (y && pathname === `/${locale}`) {
      window.scrollTo(0, parseInt(y, 10));
    }
    setScrollRestored(true);
  }, [pathname, locale]);

  // ② データ取得
  useEffect(() => {
    const fetch = async () => {
      const [{ data: stores }, { data: genres }, { data: areas }] = await Promise.all([
        supabase.from("stores").select("*").eq("is_published", true).eq("is_recommended", true).limit(3),
        supabase.from("genre_translations").select("genre_id, name").eq("locale", locale),
        supabase.from("area_translations").select("area_id, name").eq("locale", locale),
      ]);
      if (stores) setStores(stores);
      if (genres) setGenreMap(Object.fromEntries(genres.map((g) => [g.genre_id, g.name])));
      if (areas) setAreaMap(Object.fromEntries(areas.map((a) => [a.area_id, a.name])));
      setDataReady(true);
      sessionStorage.removeItem(scrollKey); // データロード後に消去
    };
    fetch();
  }, [locale]);

  // ③ 翻訳
  useEffect(() => {
    if (locale === "ja") return;
    const translate = async () => {
      const result: Record<string, string> = {};
      for (const store of stores) {
        if (store.description) {
          try {
            result[store.id] = await translateText(store.description, locale);
          } catch {
            result[store.id] = store.description;
          }
        }
      }
      setTranslatedDescriptions(result);
    };
    translate();
  }, [stores, locale]);

  // ④ 店舗クリック時に scroll 保存＋遷移
  const handleClick = async (storeId: string) => {
    sessionStorage.setItem(scrollKey, window.scrollY.toString());
    setIsLoading(true);
    try {
      await logAction("click_recommended_store", { store_id: storeId, locale });
    } catch { }
    router.push(`/stores/${storeId}`);
  };

  // ⑤ 完了してない間は高さだけ保持
  if (!scrollRestored || !dataReady) {
    return <div style={{ height: "100vh", backgroundColor: "white" }} />;
  }

  return (
    <div className="w-full bg-white flex justify-center pt-8 relative" style={{ minHeight: "100vh" }}>
      {isLoading && <div className="fixed inset-0 z-[9999] bg-white/80" />}
      <div className="w-full max-w-[600px] flex flex-col mx-auto gap-2">
        <div className="w-full px-4 flex flex-col items-center gap-1">
          <h2 className="text-lg font-bold text-zinc-900">{messages.title}</h2>
          <p className="text-xs text-slate-500 font-bold">{messages.subtitle}</p>
        </div>

        <div className="w-full flex flex-col items-center gap-4 px-4">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={{ ...store, areaTranslated: areaMap[store.area_id] }}
              locale={locale}
              index={0}
              genresMap={genreMap}
              translatedDescription={translatedDescriptions[store.id]}
              messages={messages}
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}