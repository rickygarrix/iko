import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { checkIfOpen } from "@/lib/utils";
import Image from "next/image";

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
    <div className="my-10">
      <h2 className="text-xl font-bold text-center text-gray-800 mb-1">今月のおすすめ</h2>
      <p className="text-sm text-blue-500 text-center mb-6">recommend</p>

      <div>
        {recommendedStores.map((store, index) => {
          const { isOpen, nextOpening } = checkIfOpen(store.opening_hours);

          return (
            <div key={store.id}>
              <Link href={`/stores/${store.id}`} passHref>
                <div className="bg-[#FDFBF7] p-4 transition cursor-pointer">
                  {/* 上部：店舗名 & 説明文 */}
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{store.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {store.description ?? "渋谷で40年の歴史を持つ老舗クラブ。最高音質の音響システムを導入している。"}
                  </p>

                  {/* 下部：画像 + 詳細（横並び） */}
                  <div className="flex flex-row gap-4 items-start">
                    {/* 左：画像 */}
                    <Image
                      src={store.image_url ?? "/default-image.jpg"}
                      alt={store.name}
                      width={160}
                      height={120}
                      className="object-cover w-40 h-32"
                    />

                    {/* 右：情報 */}
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>{store.area} エリア</p>
                      <p>{store.genre}</p>
                      <p className={isOpen ? "text-green-600" : "text-red-500"}>
                        {isOpen ? "営業中" : "営業時間外"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isOpen
                          ? `${nextOpening}`
                          : `${nextOpening}`}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* 区切り線（最後以外） */}
              {index !== recommendedStores.length - 1 && (
                <hr className="my-4 border-t border-gray-300" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}