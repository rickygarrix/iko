"use client";

import { useRouter } from "next/navigation";

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm("本当にこの店舗を削除しますか？");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/delete-pending-store?id=${id}`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("削除に失敗しました");
      }

      alert("削除が完了しました！");
      router.replace("/admin/pending-stores"); // ← router.pushじゃなくrouter.replace！
    } catch (error) {
      console.error("削除エラー:", error);
      alert("削除に失敗しました");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 text-white py-2 px-6 rounded hover:bg-red-600"
    >
      削除する
    </button>
  );
}