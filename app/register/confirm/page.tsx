"use client";

import { usePendingStore } from "@/lib/store/pendingStore";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/uploadImage";
import { useState } from "react";
import Image from "next/image"; // ← ⭐ 追加！

export default function StoreRegisterConfirmPage() {
  const router = useRouter();
  const pendingStore = usePendingStore((state) => state.pendingStore);
  const resetPendingStore = usePendingStore((state) => state.resetPendingStore);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      // ① 仮登録（まずは画像なし）
      const { data, error: insertError } = await supabase
        .from("pending_stores")
        .insert([
          {
            name: pendingStore.name,
            genre: pendingStore.genre,
            address: pendingStore.address,
            phone: pendingStore.phone,
            opening_hours: pendingStore.opening_hours,
            regular_holiday: pendingStore.regular_holiday,
            website_url: pendingStore.website_url,
            instagram_url: pendingStore.instagram_url,
            payment_methods: pendingStore.payment_methods,
            description: pendingStore.description,
            image_url: "",
            submitted_by_email: null,
          },
        ])
        .select(); // ★新規登録データを取得する

      if (insertError || !data || data.length === 0) {
        throw new Error("店舗データの登録に失敗しました");
      }

      const newStoreId = data[0].id as string;

      // ② 画像があればアップロード
      let uploadedImageUrl = "";
      if (pendingStore.image_file) {
        const file = pendingStore.image_file;
        const filePath = `pending_stores/${newStoreId}/${Date.now()}_${file.name}`; // サブフォルダ保存
        uploadedImageUrl = await uploadImage(file, filePath);

        // ③ 画像URLを上書き更新
        const { error: updateError } = await supabase
          .from("pending_stores")
          .update({ image_url: uploadedImageUrl })
          .eq("id", newStoreId);

        if (updateError) {
          throw new Error("画像URLの更新に失敗しました");
        }
      }

      console.log("登録成功");
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
          <Item title="住所" value={pendingStore.address} />
          <Item title="電話番号" value={pendingStore.phone} />
          <Item title="営業時間" value={pendingStore.opening_hours} />
          <Item title="定休日" value={pendingStore.regular_holiday} />
          <Item title="公式サイトURL" value={pendingStore.website_url} />
          <Item title="Instagramアカウント" value={pendingStore.instagram_url} />
          <Item title="支払い方法" value={pendingStore.payment_methods?.join(", ")} />
          <Item title="店舗説明" value={pendingStore.description} />

          {/* 画像プレビュー */}
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

        {/* エラーメッセージ */}
        {error && (
          <div className="text-red-500 text-sm font-semibold mb-4 text-center">{error}</div>
        )}

        {/* ボタン */}
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

// 🧩 店舗情報表示コンポーネント
function Item({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-gray-800 text-lg whitespace-pre-wrap">{value || "ー"}</p>
    </div>
  );
}