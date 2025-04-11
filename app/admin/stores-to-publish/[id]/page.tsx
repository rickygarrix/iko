"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Store = {
  id: string;
  name: string;
  genre: string;
};

export default function StoresToPublishPage() {
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
        .select("id, name, genre")
        .eq("is_published", false)
        .eq("is_deleted", false);

      if (error) {
        console.error("取得エラー:", error);
      } else {
        setStores(data || []);
      }
      setLoading(false);
    };

    fetchStores();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("本当に削除しますか？");
    if (!confirmed) return;

    const { error: updateError } = await supabase
      .from("stores")
      .update({ is_deleted: true, is_published: false })
      .eq("id", id);

    if (updateError) {
      alert("削除に失敗しました");
      console.error(updateError.message);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("stores")
      .select("name, genre")
      .eq("id", id)
      .single();

    if (fetchError || !data) {
      alert("削除ログ作成に失敗しました");
      console.error(fetchError?.message);
      return;
    }

    const { error: insertError } = await supabase
      .from("deleted_stores")
      .insert([
        {
          id: id,
          name: data.name,
          genre: data.genre,
          original_table: "stores",
        },
      ]);

    if (insertError) {
      alert("削除ログ保存に失敗しました");
      console.error(insertError.message);
      return;
    }

    setStores((prev) => prev.filter((store) => store.id !== id));
    alert("削除しました！");
  };

  if (loading) {
    return <div className="text-center p-10 text-gray-800">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FEFCF6] pt-24 px-10 pb-10 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-6">未公開店舗一覧</h1>

      {stores.length === 0 ? (
        <p className="text-center text-gray-500 mb-10">未公開の店舗はありません。</p>
      ) : (
        <div className="overflow-x-auto mb-10">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-4 border">店名</th>
                <th className="py-2 px-4 border">ジャンル</th>
                <th className="py-2 px-4 border">操作</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="text-center">
                  <td className="py-2 px-4 border">{store.name}</td>
                  <td className="py-2 px-4 border">{store.genre}</td>
                  <td className="py-2 px-4 border">
                    <button
                      className="bg-blue-500 text-white font-semibold rounded px-3 py-1 hover:bg-blue-600"
                      onClick={() => router.push(`/admin/stores-to-publish/${store.id}`)}
                    >
                      詳細確認
                    </button>
                    <button
                      className="bg-red-500 text-white font-semibold rounded px-3 py-1 hover:bg-red-600 ml-2"
                      onClick={() => handleDelete(store.id)}
                    >
                      削除する
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={() => router.push("/admin")}
          className="bg-gray-600 text-white py-2 px-6 rounded hover:bg-gray-700"
        >
          管理画面トップに戻る
        </button>
      </div>
    </div>
  );
}
