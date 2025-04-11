"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
};

export function RestoreStoreButton({ id }: Props) {
  const router = useRouter();

  const handleRestore = async () => {
    const confirmRestore = window.confirm("この店舗を復元しますか？");
    if (!confirmRestore) return;

    const { error } = await supabase
      .from("stores")
      .update({ is_deleted: false })
      .eq("id", id);

    if (error) {
      console.error("復元エラー:", error.message);
      alert("復元に失敗しました");
      return;
    }

    alert("復元しました！");
    router.refresh(); // 最新一覧に更新
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