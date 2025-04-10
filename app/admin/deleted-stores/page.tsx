"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RestoreStoreButton } from "@/components/RestoreStoreButton";
import { PermanentlyDeleteButton } from "@/components/PermanentlyDeleteButton";

type DeletedStore = {
  id: string;
  name: string;
  genre: string;
  original_table: "stores" | "stores_to_publish" | "pending_stores";
};

export default function DeletedStoresPage() {
  const [stores, setStores] = useState<DeletedStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeletedStores = async () => {
      const { data, error } = await supabase
        .from("deleted_stores")
        .select("id, name, genre, original_table");

      if (error) {
        console.error("取得エラー:", error.message);
      } else {
        setStores(data || []);
      }
      setLoading(false);
    };

    fetchDeletedStores();
  }, []);

  if (loading) {
    return <div className="text-center p-10 text-gray-800">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FEFCF6] p-6 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-6">削除済み店舗一覧</h1>

      {stores.length === 0 ? (
        <p className="text-center text-gray-500">削除済み店舗はありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-4 border">店名</th>
                <th className="py-2 px-4 border">ジャンル</th>
                <th className="py-2 px-4 border">元のテーブル</th>
                <th className="py-2 px-4 border">操作</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="text-center">
                  <td className="py-2 px-4 border">{store.name}</td>
                  <td className="py-2 px-4 border">{store.genre}</td>
                  <td className="py-2 px-4 border">{store.original_table}</td>
                  <td className="py-2 px-4 border space-x-2">
                    <RestoreStoreButton id={store.id} originalTable={store.original_table} />
                    <PermanentlyDeleteButton id={store.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}