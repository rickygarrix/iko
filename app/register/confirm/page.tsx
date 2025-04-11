"use client";

import { useRouter } from "next/navigation";
import { usePendingStore } from "@/lib/store/pendingStore";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/uploadImage";
import { useState } from "react";
import Image from "next/image";

export default function StoreRegisterConfirmPage() {
  const router = useRouter();
  const pendingStore = usePendingStore((state) => state.pendingStore);
  const resetPendingStore = usePendingStore((state) => state.resetPendingStore);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      // ⭐️ まずセッションリフレッシュする
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("セッションリフレッシュエラー:", refreshError);
        throw new Error("セッション更新に失敗しました。ログインし直してください。");
      }

      // ⭐️ セッション更新できたら登録を実行
      const { data, error: insertError } = await supabase
        .from("stores")
        .insert([
          {
            name: pendingStore.name || "",
            genre: pendingStore.genre || "",
            area: pendingStore.area || "",
            address: pendingStore.address || "",
            phone_number: pendingStore.phone || "",
            opening_hours: pendingStore.opening_hours || "",
            regular_holiday: pendingStore.regular_holiday || "",
            website: pendingStore.website_url || "",
            instagram: pendingStore.instagram_url || "",
            payment_methods: pendingStore.payment_methods || [],
            description: pendingStore.description || "",
            image_url: "",
            is_published: false,
            is_recommended: false,
            is_deleted: false,
            is_pending: true,
          },
        ])
        .select();

      if (insertError || !data || data.length === 0) {
        console.error("挿入エラー:", insertError);
        throw new Error("店舗データの登録に失敗しました");
      }

      const newStoreId = data[0].id as string;

      // ⭐️ 画像があればアップロード
      if (pendingStore.image_file) {
        const file = pendingStore.image_file;
        const safeFileName = file.name
          .replace(/\s/g, "_")
          .replace(/[^\w.-]/g, "");
        const filePath = `stores/${newStoreId}/${Date.now()}_${safeFileName}`;
        const uploadedImageUrl = await uploadImage(file, filePath);

        const { error: updateError } = await supabase
          .from("stores")
          .update({ image_url: uploadedImageUrl })
          .eq("id", newStoreId);

        if (updateError) {
          console.error("画像更新エラー:", updateError);
          throw new Error("画像URLの更新に失敗しました");
        }
      }

      console.log("登録成功！");
      resetPendingStore();
      router.push("/register/thanks");

    } catch (err) {
      console.error("エラー詳細:", err);
      setError(err instanceof Error ? err.message : "エラーが発生しました。時間を置いて再試行してください。");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#FEFCF6] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg p-8 text-gray-800">
        <h1 className="text-2xl font-bold text-center mb-6">店舗情報確認</h1>

        <div className="space-y-4 mb-8">
          <Item title="店名" value={pendingStore.name} />
          <Item title="ジャンル" value={pendingStore.genre} />
          <Item title="エリア" value={pendingStore.area} />
          <Item title="住所" value={pendingStore.address} />
          <Item title="電話番号" value={pendingStore.phone} />
          <Item title="営業時間" value={pendingStore.opening_hours} />
          <Item title="定休日" value={pendingStore.regular_holiday} />
          <Item title="公式サイトURL" value={pendingStore.website_url} />
          <Item title="Instagramアカウント" value={pendingStore.instagram_url} />
          <Item title="支払い方法" value={pendingStore.payment_methods?.join(", ")} />
          <Item title="店舗説明" value={pendingStore.description} />

          {pendingStore.image_url && (
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-1">店舗画像プレビュー</p>
              <Image
                src={pendingStore.image_url}
                alt="店舗外観"
                width={400}
                height={300}
                className="rounded shadow"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm font-semibold mb-4 text-center">{error}</div>
        )}

        <div className="flex flex-col gap-4">
          <button
            onClick={handleRegister}
            className="w-full bg-[#1F1F21] text-white rounded p-3 hover:bg-[#333]"
          >
            登録する
          </button>
          <button
            onClick={handleBack}
            className="w-full border border-gray-400 text-gray-700 rounded p-3 hover:bg-gray-100"
          >
            修正する
          </button>
        </div>
      </div>
    </div>
  );
}

function Item({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-gray-800 text-lg whitespace-pre-wrap">{value || "ー"}</p>
    </div>
  );
}