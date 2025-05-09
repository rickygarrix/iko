"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/types/post";

type Props = {
  post: Post;
  stores: Store[]; // ⭐ 追加
  tagCategories: TagCategory[]; // ⭐ 追加
  onClose: () => void;
  onUpdated: () => void;
};

// 仮の型（必要に応じて共通化してOK）
type Store = { id: string; name: string };
type TagCategory = {
  id: string;
  key: string;
  label: string;
  min_label: string;
  max_label: string;
};

export default function EditPostModal({ post, onClose, onUpdated }: Props) {
  const [body, setBody] = useState(post.body);
  const [storeId, setStoreId] = useState(post.store?.id || "");
  const [tagValues, setTagValues] = useState<{ [key: string]: number }>({});
  const [stores, setStores] = useState<Store[]>([]);
  const [tagCategories, setTagCategories] = useState<TagCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStores();
    fetchTagCategories();

    // 初期評価のセット
    const initialValues: { [key: string]: number } = {};
    post.post_tag_values?.forEach((tag) => {
      initialValues[tag.tag_category.key] = tag.value;
    });
    setTagValues(initialValues);
  }, [post]);

  const fetchStores = async () => {
    const { data } = await supabase.from("stores").select("id, name");
    if (data) setStores(data);
  };

  const fetchTagCategories = async () => {
    const { data } = await supabase.from("tag_categories").select("*");
    if (data) setTagCategories(data);
  };

  const handleUpdate = async () => {
    setLoading(true);

    // 本体更新
    const { error: updateError } = await supabase
      .from("posts")
      .update({ body, store_id: storeId })
      .eq("id", post.id);

    if (updateError) {
      alert("更新に失敗しました");
      console.error(updateError);
      setLoading(false);
      return;
    }

    // 評価削除 → 再挿入（上書き）
    await supabase.from("post_tag_values").delete().eq("post_id", post.id);

    const tagInserts = Object.entries(tagValues).map(([key, value]) => {
      const category = tagCategories.find((c) => c.key === key);
      return {
        post_id: post.id,
        tag_category_id: category?.id,
        value,
      };
    });

    const { error: tagError } = await supabase.from("post_tag_values").insert(tagInserts);

    setLoading(false);

    if (tagError) {
      alert("評価の更新に失敗しました");
      console.error(tagError);
    } else {
      onUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
      <div className="bg-white p-6 rounded-md w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold">投稿を編集</h2>

        {/* 店舗選択 */}
        <select
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="">店舗を選択</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>

        {/* コメント */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border rounded p-2"
          rows={3}
        />

        {/* 評価スライダー */}
        {tagCategories.map((tag) => (
          <div key={tag.id} className="space-y-1">
            <label className="text-sm font-medium">{tag.label}</label>
            <input
              type="range"
              min={1}
              max={5}
              value={tagValues[tag.key] || 3}
              onChange={(e) =>
                setTagValues({ ...tagValues, [tag.key]: Number(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{tag.min_label}</span>
              <span>{tag.max_label}</span>
            </div>
          </div>
        ))}

        {/* ボタン */}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-gray-600">
            キャンセル
          </button>
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-1 rounded"
            disabled={loading}
          >
            更新
          </button>
        </div>
      </div>
    </div>
  );
}