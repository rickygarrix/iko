"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { checkIfOpen } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion"; // ←追加！

interface Store {
  id: string;
  name: string;
  genre: string;
  area: string;
  opening_hours: string;
  image_url?: string | null;
  description?: string;
}

export default function RecommendedStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [restoreY, setRestoreY] = useState<number | null>(null);
  const [storesReady, setStoresReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchStores = async () => {
      const { data, error } = await supabase.from("stores").select("*").limit(3);
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
    if (saved && pathname === "/") {
      setRestoreY(parseInt(saved, 10));
    }
  }, [pathname]);

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

  const handleClick = (storeId: string) => {
    if (pathname === "/") {
      const currentY = window.scrollY;
      sessionStorage.setItem("recommendedScrollY", currentY.toString());
    }
    setIsLoading(true);
    router.push(`/stores/${storeId}`);
  };

  return (
    <div className="w-full bg-white flex justify-center pt-8 relative">
      {/* オーバーレイ */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-white/80" />
      )}

      <div className="w-full max-w-[600px] flex flex-col mx-auto gap-2">
        {/* 見出し */}
        <div className="w-full px-4 flex flex-col justify-start items-center gap-1">
          <div className="text-center text-zinc-900 text-lg font-bold leading-relaxed tracking-widest">
            今月のおすすめ
          </div>
          <div className="text-center text-slate-500 text-xs font-bold leading-none tracking-wide">
            Recommend
          </div>
        </div>

        {/* リスト */}
        {!storesReady ? (
          <div style={{ height: "100vh" }} />
        ) : (
          <div className="w-full flex flex-col justify-start items-center gap-px">
            {stores.map((store, index) => {
              const { isOpen, nextOpening } = checkIfOpen(store.opening_hours);
              return (
                <motion.div
                  key={store.id}
                  onClick={() => handleClick(store.id)}
                  className="w-full px-4 py-4 bg-white flex flex-col gap-4 border-b last:border-b-0 cursor-pointer
                    hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="text-zinc-900 text-base font-semibold leading-normal">
                      {store.name}
                    </div>
                    <div className="text-zinc-900 text-xs font-light leading-none">
                      {store.description || "店舗の詳細情報がありません。"}
                    </div>
                  </div>

                  <div className="flex gap-4 items-center">
                    <img
                      className="w-40 h-24 rounded-lg outline outline-2 outline-zinc-900 object-cover"
                      src={store.image_url || "/default-image.jpg"}
                      alt={store.name}
                    />
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="text-zinc-900 text-sm font-light">
                        {store.area} / {store.genre}
                      </div>
                      <div className="text-sm font-light">
                        <span className={isOpen ? "text-green-700" : "text-rose-700"}>
                          {isOpen ? "営業中" : "営業時間外"}
                        </span>
                      </div>
                      <div className="text-sm font-light text-zinc-700">
                        {nextOpening}
                      </div>
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