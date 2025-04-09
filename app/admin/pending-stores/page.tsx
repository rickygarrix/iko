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

  // 🌟 ページロード時に認証チェック
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("認証エラー:", error);
        alert("エラーが発生しました。もう一度ログインしてください。");
        router.push("/login");
        return;
      }

      const user = data.user;

      if (!user) {
        alert("ログインが必要です");
        router.push("/login"); // 未ログインならログインページへ
        return;
      }

      // ここで管理者かチェック（特定のメールアドレスだけ通す）
      if (user.email !== "chloerickyc@gmail.com") { // ←君の管理用メールにしてる
        alert("アクセス権限がありません");
        router.push("/"); // トップページへリダイレクト
        return;
      }
    };

    checkAuth();
  }, [router]);

  // データ取得
  useEffect(() => {
    const fetchPendingStores = async () => {
      const { data, error } = await supabase
        .from("pending_stores")
        .select("id, name, genre, description");

      if (error) {
        console.error("取得エラー:", error);
      } else {
        setPendingStores(data || []);
      }
      setLoading(false);
    };

    fetchPendingStores();
  }, []);

  // ⭐ 承認処理
  const handleApprove = async (storeId: string) => {
    const confirmApprove = window.confirm("この店舗を承認して登録しますか？");
    if (!confirmApprove) return;

    const { data, error: fetchError } = await supabase
      .from("pending_stores")
      .select("*")
      .eq("id", storeId)
      .single();

    if (fetchError || !data) {
      alert("データ取得に失敗しました");
      return;
    }

    const { error: insertError } = await supabase.from("stores").insert([
      {
        name: data.name,
        genre: data.genre,
        address: data.address,
        phone: data.phone,
        opening_hours: data.opening_hours,
        regular_holiday: data.regular_holiday,
        website_url: data.website_url,
        instagram_url: data.instagram_url,
        payment_methods: data.payment_methods,
        description: data.description,
        image_url: data.image_url,
      },
    ]);

    if (insertError) {
      alert("storesテーブルへの登録に失敗しました");
      return;
    }

    const { error: deleteError } = await supabase
      .from("pending_stores")
      .delete()
      .eq("id", storeId);

    if (deleteError) {
      alert("pending_storesからの削除に失敗しました");
      return;
    }

    alert("承認が完了しました！");
    location.reload();
  };

  // ⭐ 削除処理
  const handleDelete = async (storeId: string) => {
    const confirmDelete = window.confirm("この店舗を削除しますか？");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("pending_stores")
      .delete()
      .eq("id", storeId);

    if (error) {
      alert("削除に失敗しました");
    } else {
      alert("削除が完了しました！");
      location.reload();
    }
  };

  if (loading) {
    return <div className="text-center p-10 text-gray-800">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FEFCF6] p-6 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">店舗登録申請一覧</h1>

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