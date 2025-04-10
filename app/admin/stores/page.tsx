"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Store = {
  id: string;
  name: string;
  genre: string;
  is_recommended: boolean; // ⭐️ 追加
};

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("ログインが必要です");
        router.push("/login");
        return;
      }

      if (user.email !== "chloerickyc@gmail.com") {
        alert("アクセス権限がありません");
        router.push("/");
        return;
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchStores = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, genre, is_recommended") // ⭐️ is_recommendedも取得
        .eq("is_published", true);

      if (error) {
        console.error("取得エラー:", error);
      } else {
        setStores(data || []);
      }
      setLoading(false);
    };

    fetchStores();
  }, []);

  const handleRecommendToggle = async (id: string, recommend: boolean) => {
    // ⭐️ おすすめを付ける場合は3件まで制限
    if (recommend) {
      const recommendedCount = stores.filter((s) => s.is_recommended).length;
      if (recommendedCount >= 3) {
        alert("おすすめにできるのは最大3店舗までです");
        return;
      }
    }

    const { error } = await supabase
      .from("stores")
      .update({ is_recommended: recommend })
      .eq("id", id);

    if (error) {
      alert("更新に失敗しました");
    } else {
      // ローカルデータも更新
      setStores((prev) =>
        prev.map((store) =>
          store.id === id ? { ...store, is_recommended: recommend } : store
        )
      );
    }
  };

  if (loading) {
    return <div className="text-center p-10 text-gray-800">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FEFCF6] p-6 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-6">公開済み店舗一覧</h1>

      {stores.length === 0 ? (
        <p className="text-center text-gray-500">公開済みの店舗はありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-4 border">店名</th>
                <th className="py-2 px-4 border">ジャンル</th>
                <th className="py-2 px-4 border">おすすめ</th>
                <th className="py-2 px-4 border">操作</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="text-center">
                  <td className="py-2 px-4 border">{store.name}</td>
                  <td className="py-2 px-4 border">{store.genre}</td>
                  <td className="py-2 px-4 border">
                    {store.is_recommended ? "🌟おすすめ中" : "ー"}
                  </td>
                  <td className="py-2 px-4 border space-x-2">
                    <button
                      className="bg-blue-500 text-white font-semibold rounded px-3 py-1 hover:bg-blue-600"
                      onClick={() => router.push(`/admin/stores/${store.id}`)}
                    >
                      編集する
                    </button>
                    {store.is_recommended ? (
                      <button
                        className="bg-gray-400 text-white font-semibold rounded px-3 py-1 hover:bg-gray-500"
                        onClick={() => handleRecommendToggle(store.id, false)}
                      >
                        おすすめ解除
                      </button>
                    ) : (
                      <button
                        className="bg-green-500 text-white font-semibold rounded px-3 py-1 hover:bg-green-600"
                        onClick={() => handleRecommendToggle(store.id, true)}
                      >
                        おすすめにする
                      </button>
                    )}
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