"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Store = {
  id: string;
  name: string;
  address: string;
  genre: string;
  capacity: number;
};

export default function Search() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams(); // URLのクエリを取得

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      let query = supabase.from("stores").select("*");

      // URLクエリの値を取得（複数選択対応）
      const genres = searchParams.get("genre")?.split(",") || [];
      const areas = searchParams.get("area")?.split(",") || [];
      const capacities = searchParams.get("capacity")?.split(",") || [];

      // クエリにフィルターを適用（OR検索）
      if (genres.length > 0) query = query.in("genre", genres);
      if (areas.length > 0) query = query.in("area", areas);
      if (capacities.length > 0) query = query.lte("capacity", Math.max(...capacities.map(Number)));

      const { data, error } = await query;

      if (error) {
        console.error("🔥 Supabase Error:", error);
      } else {
        console.log("✅ Supabase Data:", data);
        setStores(data);
      }
      setLoading(false);
    };

    fetchStores();
  }, [searchParams]); // URLが変わったら再検索

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">検索結果</h1>

      {loading ? (
        <p>ロード中...</p>
      ) : stores.length === 0 ? (
        <p>該当する店舗がありません。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stores.map((store) => (
            <Link key={store.id} href={`/stores/${store.id}`} passHref>
              <div className="p-4 bg-gray-800 rounded shadow cursor-pointer hover:bg-gray-700 transition">
                <h2 className="text-xl font-semibold">{store.name}</h2>
                <p className="text-gray-400">{store.genre} / {store.capacity}人</p>
                <p className="text-gray-300">{store.address}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}