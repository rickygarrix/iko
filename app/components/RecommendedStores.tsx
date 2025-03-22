import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { checkIfOpen } from "@/lib/utils";
import Image from "next/image";

// 型定義（必要なら description を追加）
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
      <h2 className="text-xl font-bold text-gray-800 mb-1">今月のおすすめ</h2>
      <p className="text-sm text-blue-500 mb-6">recommend</p>

      <div className="space-y-6">
        {recommendedStores.map((store) => {
          const { isOpen } = checkIfOpen(store.opening_hours);
          return (
            <Link key={store.id} href={`/stores/${store.id}`} passHref>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{store.name}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {store.description ?? "渋谷で40年の歴史を持つ老舗クラブ。最高音質の音響システムを導入している。"}
                </p>

                {/* 横並び：画像 + 情報（画像左、情報右） */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  {/* 画像 */}
                  <Image
                    src={store.image_url ?? "/default-image.jpg"}
                    alt={store.name}
                    width={160}
                    height={120}
                    className="w-full md:w-48 h-36 object-cover rounded"
                  />

                  {/* テキスト情報 */}
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>{store.area}エリア</p>
                    <p>{store.genre}</p>
                    <p className={isOpen ? "text-green-600" : "text-red-500"}>
                      {isOpen ? "営業中" : "営業時間外"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}