import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { checkIfOpen } from "@/lib/utils";

type Store = {
  id: string;
  name: string;
  genre: string;
  area: string;
  opening_hours: string;
  image_url?: string | null;
  capacity: string;
  payment_methods: string[];
  description?: string;
};

export default function RecommendedStores() {
  const [recommendedStores, setRecommendedStores] = useState<Store[]>([]);

  useEffect(() => {
    const fetchRecommendedStores = async () => {
      const { data, error } = await supabase.from("stores").select("*").limit(3);

      if (error) {
        console.error("🔥 Supabase Error:", error.message);
        setRecommendedStores([]);
      } else {
        setRecommendedStores(data || []);
      }
    };

    fetchRecommendedStores();
  }, []);

  return (
    <div className=" px-4 bg-[#FEFCF6]">
      <h2 className="text-xl font-bold p-8 text-center text-gray-800 py-[20px] pb-[4px]  leading-tight">今月のおすすめ</h2>
      <p className="text-sm text-[#4B5C9E] text-center leading-tight mb-12">recommend</p>

      <div>
        {recommendedStores.map((store, index) => {
          const { isOpen, nextOpening } = checkIfOpen(store.opening_hours);

          return (
            <div key={store.id} className="bg-[#FEFCF6] pb-6 rounded-xl" >
              <Link href={`/stores/${store.id}`} passHref>
                <div className="cursor-pointer space-y-3">
                  {/* 店名 */}
                  <h3 className="text-[16px] font-bold text-[#1F1F21] leading-snug">
                    {store.name}
                  </h3>

                  {/* 説明文 */}
                  <p className="text-[12px] text-[#000000] leading-relaxed text-left">
                    {store.description ?? "渋谷で40年の歴史を持つ老舗クラブ。最高音質の音響システムを導入している。"}
                  </p>

                  {/* 下段：画像と情報 */}
                  <div className="flex gap-4 items-center">
                    {/* 画像 */}
                    <div className="w-[160px] h-[90px] rounded-[8px] border-[2px] border-[#1F1F21] overflow-hidden">
                      <img
                        src={store.image_url ?? "/default-image.jpg"}
                        alt={store.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* テキスト情報 */}
                    <div className="text-left space-y-1 text-[14px] text-[#1F1F21]">
                      <p>{store.area} / {store.genre}</p>
                      <p className={`font-semibold ${isOpen ? "text-green-600" : "text-red-500"}`}>
                        {isOpen ? "営業中" : "営業時間外"}
                      </p>
                      <p className="text-xs text-[#1F1F21]">
                        {nextOpening}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* 区切り線（最後以外） */}
              {index !== recommendedStores.length - 1 && (
                <hr className="mt-6 border-t border-gray-300 w-screen -mx-4" />
              )}
            </div>


          );
        })}
      </div>
    </div>
  );
}