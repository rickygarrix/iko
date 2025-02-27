"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Search() {
  const [stores, setStores] = useState<any[]>([]); // クラブ情報を保存
  const [loading, setLoading] = useState(true); // ロード状態

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("stores").select("*");
      if (error) {
        console.error("🔥 Supabase Error:", JSON.stringify(error, null, 2));
      } else {
        console.log("✅ Supabase Data:", data);
        setStores(data);
      }
      setLoading(false);
    };
    fetchStores();
  }, []);

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
            <Link key={store.id} href={`/stores/${store.id}`}>
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