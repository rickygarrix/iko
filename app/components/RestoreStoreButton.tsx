"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  originalTable: "stores" | "stores_to_publish" | "pending_stores";
};

export function RestoreStoreButton({ id, originalTable }: Props) {
  const router = useRouter();

  const handleRestore = async () => {
    const confirmRestore = window.confirm("この店舗を復元しますか？");
    if (!confirmRestore) return;

    // ① deleted_storesからデータ取得
    const { data: deletedStore, error: fetchError } = await supabase
      .from("deleted_stores")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !deletedStore) {
      alert("復元に失敗しました（取得エラー）");
      console.error(fetchError);
      return;
    }

    // ② 元のテーブルに挿入
    const insertData = { ...deletedStore };
    delete insertData.id; // idは元テーブルで自動採番される想定（必要なら調整）

    const { error: insertError } = await supabase
      .from(originalTable)
      .insert(insertData);

    if (insertError) {
      alert("復元に失敗しました（挿入エラー）");
      console.error(insertError);
      return;
    }

    // ③ deleted_storesから削除
    const { error: deleteError } = await supabase
      .from("deleted_stores")
      .delete()
      .eq("id", id);

    if (deleteError) {
      alert("復元に失敗しました（削除エラー）");
      console.error(deleteError);
      return;
    }

    alert("復元が完了しました！");
    router.refresh();
  };

  return (
    <button
      onClick={handleRestore}
      className="bg-blue-500 text-white font-semibold rounded px-3 py-1 hover:bg-blue-600"
    >
      復元
    </button>
  );
}