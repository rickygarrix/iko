"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type PendingStore = {
  id: string;
  name: string;
  genre: string;
  description: string;
};

export default function PendingStoresAdminPage() {
  const [pendingStores, setPendingStores] = useState<PendingStore[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        alert("ログインが必要です");
        router.push("/login");
        return;
      }
      if (data.user.email !== "chloerickyc@gmail.com") {
        alert("アクセス権限がありません");
        router.push("/");
        return;
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchPendingStores = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, genre, description")
        .eq("is_pending", true)
        .eq("is_deleted", false);

      if (error) {
        console.error("取得エラー:", error);
      } else {
        setPendingStores(data || []);
      }
      setLoading(false);
    };

    fetchPendingStores();
  }, []);

  const handleApprove = async (storeId: string) => {
    const confirmApprove = window.confirm("この店舗を承認しますか？");
    if (!confirmApprove) return;

    const { error } = await supabase
      .from("stores")
      .update({ is_pending: false, is_published: true })
      .eq("id", storeId);

    if (error) {
      alert("承認に失敗しました");
      return;
    }

    alert("承認しました！");
    location.reload();
  };

  const handleDelete = async (storeId: string) => {
    const confirmDelete = window.confirm("この店舗を削除しますか？");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("stores")
      .update({ is_deleted: true })
      .eq("id", storeId);

    if (error) {
      alert("削除に失敗しました");
      return;
    }

    alert("削除しました！");
    location.reload();
  };

  if (loading) {
    return <div className="text-center p-10 text-gray-800">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FEFCF6] pt-24 px-10 pb-10 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-6">店舗登録申請一覧</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-4 border">店名</th>
              <th className="py-2 px-4 border">ジャンル</th>
              <th className="py-2 px-4 border">説明</th>
              <th className="py-2 px-4 border">操作</th>
            </tr>
          </thead>
          <tbody>
            {pendingStores.map((store) => (
              <tr key={store.id} className="text-center">
                <td className="py-2 px-4 border">{store.name}</td>
                <td className="py-2 px-4 border">{store.genre}</td>
                <td className="py-2 px-4 border">{store.description.slice(0, 30)}...</td>
                <td className="py-2 px-4 border space-x-2">
                  <button
                    className="bg-blue-500 text-white font-semibold rounded px-3 py-1 hover:bg-blue-600"
                    onClick={() => router.push(`/admin/pending-stores/${store.id}`)}
                  >
                    詳細
                  </button>
                  <button
                    className="bg-green-500 text-white font-semibold rounded px-3 py-1 hover:bg-green-600"
                    onClick={() => handleApprove(store.id)}
                  >
                    承認
                  </button>
                  <button
                    className="bg-red-500 text-white font-semibold rounded px-3 py-1 hover:bg-red-600"
                    onClick={() => handleDelete(store.id)}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
