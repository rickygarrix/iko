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
  payment_methods:string;


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
    <div>
      <h2 className="text-lg font-semibold mt-6">今月のおすすめのハコ</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {recommendedStores.map((store) => {
          const { isOpen, nextOpening } = checkIfOpen(store.opening_hours);
          return (
            <Link key={store.id} href={`/stores/${store.id}`} passHref>
              <div className="p-4 bg-gray-800 rounded shadow flex">
                <img
                  src={store.image_url ?? "/default-image.jpg"}
                  alt={store.name}
                  className="w-32 h-32 object-cover rounded"
                />
                <div className="ml-4 flex flex-col justify-between">
                  <h1 className="text-xl font-semibold">{store.name}</h1>
                  <p className="text-gray-400">📍: {store.area} / 🎵{store.genre}</p>
                  <p className={isOpen ? "text-green-400" : "text-red-400"}>🕗 {isOpen ? "営業中" : "営業時間外"}</p>
                  <p className="text-white">{nextOpening}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}