"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
};

export function PermanentlyDeleteButton({ id }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "この店舗を完全に削除しますか？（※復元できなくなります）"
    );
    if (!confirmDelete) return;

    // 🔥 storesテーブルから物理削除！
    const { error } = await supabase
      .from("stores")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("完全削除エラー:", error.message);
      alert("完全削除に失敗しました");
      return;
    }

    alert("完全に削除しました！");
    router.refresh(); // 最新一覧に更新
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 text-white font-semibold rounded px-3 py-1 hover:bg-red-600"
    >
      完全削除
    </button>
  );
}