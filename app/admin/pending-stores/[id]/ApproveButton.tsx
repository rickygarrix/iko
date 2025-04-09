"use client";

import { useRouter } from "next/navigation";

export function ApproveButton({ id }: { id: string }) {
  const router = useRouter();

  const handleApprove = async () => {
    const confirmed = window.confirm("この店舗を承認しますか？");
    if (!confirmed) return;

    // サーバーのAPIルートを叩く（仮に /api/approve-store だとする）
    const res = await fetch(`/api/approve-store?id=${id}`, { method: "POST" });

    if (res.ok) {
      alert("承認が完了しました！");
      router.push("/admin/pending-stores"); // 承認後リストに戻る
    } else {
      alert("承認に失敗しました");
    }
  };

  return (
    <button
      onClick={handleApprove}
      className="mt-6 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
    >
      承認する
    </button>
  );
}