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
      "この店舗を完全に削除しますか？（復元できなくなります）"
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("deleted_stores")
      .delete()
      .eq("id", id);

    if (error) {
      alert("削除に失敗しました");
      console.error(error);
    } else {
      alert("完全に削除しました！");
      router.refresh(); // 画面リフレッシュ
    }
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