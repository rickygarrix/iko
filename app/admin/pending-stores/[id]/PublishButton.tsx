// app/admin/[id]/PublishButton.tsx

"use client";

import { useRouter } from "next/navigation";

export function PublishButton({ id }: { id: string }) {
  const router = useRouter();

  const handlePublish = async () => {
    const confirmed = window.confirm("この店舗を公開しますか？");
    if (!confirmed) return;

    const res = await fetch(`/api/publish-store?id=${id}`, { method: "POST" });

    if (res.ok) {
      alert("公開が完了しました！");
      router.refresh(); // ページをリロードして最新状態に
    } else {
      alert("公開に失敗しました");
    }
  };

  return (
    <button
      onClick={handlePublish}
      className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
    >
      公開する
    </button>
  );
}