"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// 店舗データの型定義
type Store = {
  id: string;
  name: string;
  address: string;
  genre: string;
  capacity: number;
};

function SearchResults() {
  const searchParams = useSearchParams();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      let query = supabase.from("stores").select("*");

      const genre = searchParams.get("genre");
      const area = searchParams.get("area");
      const capacity = searchParams.get("capacity");

      if (genre) query = query.eq("genre", genre);
      if (area) query = query.eq("area", area);
      if (capacity) query = query.lte("capacity", Number(capacity));

      const { data, error } = await query;

      if (error) {
        console.error("🔥 Supabase Error:", error);
      } else {
        setStores(data);
      }
      setLoading(false);
    };

    fetchStores();
  }, [searchParams]);

  return (
    <div>

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

export default function SearchPage() {
  return (
    <Suspense fallback={<p>検索結果を読み込み中...</p>}>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        {/* ホームに戻る */}
        <h1 className="text-3xl font-bold mb-6 no-underline hover:no-underline">
          <Link href="/">オトナビ</Link>
        </h1>
        <SearchResults />
      </div>
    </Suspense>
  );
}