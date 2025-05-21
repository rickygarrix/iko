"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Store = {
  id: string;
  name: string;
};

type TagCategory = {
  id: string;
  key: string;
  label: string;
  min_label: string;
  max_label: string;
};

type Props = {
  stores?: Store[]; // 任意：投稿画面などで複数選択肢がある場合
  selectedStore?: Store; // 任意：店舗詳細ページなどで特定の店舗に固定投稿
  tagCategories: TagCategory[];
  user: User;
  onClose: () => void;
  onPosted: () => void;
};

export default function NewPostModal({
  stores = [],
  selectedStore,
  tagCategories,
  user,
  onClose,
  onPosted,
}: Props) {
  const [body, setBody] = useState("");
  const [storeId, setStoreId] = useState(selectedStore?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<Record<string, number>>(
    Object.fromEntries(tagCategories.map((cat) => [cat.key, 3]))
  );

  const handleSubmit = async () => {
    if (!body || !user || !storeId) return;
    setLoading(true);

    const { data: inserted, error } = await supabase
      .from("posts")
      .insert([
        {
          user_id: user.id,
          body,
          is_public: true,
          store_id: storeId,
        },
      ])
      .select("id");

    if (error || !inserted?.[0]?.id) {
      console.error("投稿エラー:", error?.message);
      setLoading(false);
      return;
    }

    const postId = inserted[0].id;
    const tagInserts = tagCategories.map((cat) => ({
      post_id: postId,
      tag_category_id: cat.id,
      value: tags[cat.key],
    }));

    const { error: tagError } = await supabase
      .from("post_tag_values")
      .insert(tagInserts);

    if (tagError) {
      console.error("タグ登録エラー:", tagError.message);
    }

    setBody("");
    setStoreId("");
    onPosted();
    onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <h2 className="text-lg font-bold mb-4">新規投稿</h2>

        {/* 店舗選択 or 固定表示 */}
        {selectedStore ? (
          <div className="mb-2 text-center font-semibold text-sm text-gray-700">
            📍 投稿先：{selectedStore.name}
          </div>
        ) : (
          <select
            className="w-full border rounded p-2 mb-2 text-black"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
          >
            <option value="">店舗を選択</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        )}

        <textarea
          className="w-full border rounded p-2 text-black mb-2"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="投稿内容を入力"
        />

        {tagCategories.map((cat) => (
          <div key={cat.id} className="mb-4">
            <p className="text-sm mb-1">
              {cat.label}：<strong>{tags[cat.key]}</strong>（
              {cat.min_label}〜{cat.max_label}）
            </p>
            <input
              type="range"
              min={1}
              max={5}
              value={tags[cat.key]}
              onChange={(e) =>
                setTags({ ...tags, [cat.key]: +e.target.value })
              }
              className="w-full"
            />
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="text-gray-500">
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "投稿中..." : "投稿する"}
          </button>
        </div>
      </div>
    </div>
  );
}