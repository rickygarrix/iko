"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

type Store = {
  id: string;
  name: string;
  genre: string;
  address: string;
  phone_number: string;
  opening_hours: string;
  regular_holiday: string;
  website: string;
  instagram: string;
  payment_methods: string[];
  description: string;
  image_url: string;
  is_published: boolean;
};

export default function StoreToPublishEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .eq("is_published", false)
        .single<Store>();

      if (error || !data) {
        console.error("データ取得エラー:", error);
        setError("データ取得に失敗しました");
      } else {
        setStore(data);
      }
      setLoading(false);
    };

    if (id) {
      fetchStore();
    }
  }, [id]);

  const handleChange = <K extends keyof Store>(field: K, value: Store[K]) => {
    if (!store) return;
    setStore({ ...store, [field]: value });
  };

  const handleSave = async () => {
    if (!store) return;

    let imageUrl = store.image_url;

    if (imageFile) {
      const filePath = `stores/${id}/${Date.now()}_${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("store-images")
        .upload(filePath, imageFile, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        setError("画像アップロードに失敗しました");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("store-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("stores")
      .update({
        ...store,
        image_url: imageUrl,
      })
      .eq("id", id);

    if (updateError) {
      setError("保存に失敗しました");
    } else {
      alert("保存しました！");
      router.push("/admin/stores-to-publish");
    }
  };

  if (loading) return <div className="text-center p-10">読み込み中...</div>;
  if (!store) return <div className="text-center p-10">データが見つかりませんでした</div>;

  return (
    <div className="min-h-screen bg-[#FEFCF6] p-6">
      <div className="max-w-2xl mx-auto bg-white shadow rounded p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">未公開店舗の編集</h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* 入力フォーム */}
        <InputField label="店名" value={store.name} onChange={(v) => handleChange("name", v)} />
        <InputField label="ジャンル" value={store.genre} onChange={(v) => handleChange("genre", v)} />
        <InputField label="住所" value={store.address} onChange={(v) => handleChange("address", v)} />
        <InputField label="電話番号" value={store.phone_number} onChange={(v) => handleChange("phone_number", v)} />
        <InputField label="営業時間" value={store.opening_hours} onChange={(v) => handleChange("opening_hours", v)} />
        <InputField label="定休日" value={store.regular_holiday} onChange={(v) => handleChange("regular_holiday", v)} />
        <InputField label="公式サイト" value={store.website} onChange={(v) => handleChange("website", v)} />
        <InputField label="Instagram" value={store.instagram} onChange={(v) => handleChange("instagram", v)} />
        <InputField
          label="支払い方法（カンマ区切り）"
          value={store.payment_methods.join(", ")}
          onChange={(v) => handleChange("payment_methods", v.split(",").map((s) => s.trim()))}
        />
        <TextAreaField label="説明" value={store.description} onChange={(v) => handleChange("description", v)} />

        {/* 画像 */}
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">店舗画像</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full border rounded p-2 text-gray-800 bg-white"
          />
          {store.image_url && (
            <div className="mt-4">
              <Image
                src={store.image_url}
                alt="店舗画像"
                width={400}
                height={300}
                className="rounded shadow"
              />
            </div>
          )}
        </div>

        {/* ボタン */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handleSave}
            className="bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600"
          >
            保存する
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}

// 共通：テキスト入力
function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-gray-700 text-sm font-semibold mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded p-2 text-gray-800"
      />
    </div>
  );
}

// 共通：テキストエリア
function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-gray-700 text-sm font-semibold mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded p-2 text-gray-800"
        rows={5}
      />
    </div>
  );
}