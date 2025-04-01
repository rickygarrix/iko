import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { checkIfOpen } from "@/lib/utils";

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

  return (
    <div className="w-full bg-white flex justify-center pt-8">
      <div className="w-full max-w-[600px] flex flex-col mx-auto gap-2">
        {/* 見出し */}
        <div className="w-full px-4 flex flex-col justify-start items-center gap-1">
          <div className="text-center text-zinc-900 text-lg font-bold font-['Zen_Kaku_Gothic_New'] leading-relaxed tracking-widest">
            今月のおすすめ
          </div>
          <div className="text-center text-slate-500 text-xs font-bold font-['Zen_Kaku_Gothic_New'] leading-none tracking-wide">
            Recommend
          </div>
        </div>

        {/* リスト */}
        <div className="w-full flex flex-col justify-start items-center gap-px">
          {stores.map((store) => {
            const { isOpen, nextOpening } = checkIfOpen(store.opening_hours);

            return (
              <Link
                href={`/stores/${store.id}`}
                key={store.id}
                className="w-full px-4 py-4 bg-white flex flex-col gap-4 border-b last:border-b-0"
              >
                <div className="flex flex-col gap-2">
                  <div className="text-zinc-900 text-base font-semibold font-['Hiragino_Kaku_Gothic_ProN'] leading-normal">
                    {store.name}
                  </div>
                  <div className="text-zinc-900 text-xs font-light font-['Hiragino_Kaku_Gothic_ProN'] leading-none">
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
                      <span className={`${isOpen ? "text-green-700" : "text-rose-700"}`}>
                        {isOpen ? "営業中" : "営業時間外"}
                      </span>
                    </div>
                    <div className="text-sm font-light text-zinc-700">
                      {nextOpening}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}