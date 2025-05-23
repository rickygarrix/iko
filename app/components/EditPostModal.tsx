"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/types/post";

type Props = {
  post: Post;
  stores: Store[];
  tagCategories: TagCategory[];
  onClose: () => void;
  onUpdated: () => Promise<void>; // fetchPosts を待機するため Promise
};

type Store = { id: string; name: string };
type TagCategory = {
  id: string;
  key: string;
  label: string;
  min_label: string;
  max_label: string;
};

export default function EditPostModal({
  post,
  stores,
  tagCategories,
  onClose,
  onUpdated,
}: Props) {
  const [body, setBody] = useState(post.body || "");
  const [storeId, setStoreId] = useState(post.store?.id || "");
  const [tagValues, setTagValues] = useState<{ [key: string]: number }>({});
  const [imageUrl, setImageUrl] = useState(post.image_url || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialValues: { [key: string]: number } = {};
    post.post_tag_values?.forEach((tag) => {
      initialValues[tag.tag_category.key] = tag.value;
    });
    setTagValues(initialValues);
  }, [post]);

  const handleUpdate = async () => {
    setLoading(true);

    let newImageUrl = imageUrl;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${post.id}/${fileName}`;

      // 古い画像がある場合は削除（失敗しても続行）
      if (post.image_url) {
        const oldPath = post.image_url.split("/").slice(-2).join("/");
        await supabase.storage.from("post-images").remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        alert("画像のアップロードに失敗しました");
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);
      newImageUrl = urlData?.publicUrl || "";
    }

    // 投稿内容更新
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        body,
        store_id: storeId,
        image_url: newImageUrl,
      })
      .eq("id", post.id);

    if (updateError) {
      alert("投稿の更新に失敗しました");
      setLoading(false);
      return;
    }

    // タグ削除 → 挿入（連続処理）
    const { error: deleteError } = await supabase
      .from("post_tag_values")
      .delete()
      .eq("post_id", post.id);

    if (deleteError) {
      console.error("タグ削除失敗:", deleteError);
    }

    // 最小遅延を加える（Supabaseの即時整合性の問題対策）
    await new Promise((res) => setTimeout(res, 300));

    const tagInserts = Object.entries(tagValues).map(([key, value]) => {
      const cat = tagCategories.find((c) => c.key === key);
      return {
        post_id: post.id,
        tag_category_id: cat?.id,
        value,
      };
    });

    const { error: insertError } = await supabase
      .from("post_tag_values")
      .insert(tagInserts);

    if (insertError) {
      alert("タグ更新に失敗しました");
      setLoading(false);
      return;
    }

    await onUpdated(); // ← fetchPosts を await で確実に反映
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold">投稿を編集</h2>

        {/* 店舗選択 */}
        <select
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">店舗を選択</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>

        {/* 本文 */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border p-2 rounded"
          rows={3}
        />

        {/* タグ入力 */}
        <div className="space-y-3">
          {tagCategories.map((cat) => (
            <div key={cat.id}>
              <label className="text-sm font-medium">{cat.label}</label>
              <input
                type="range"
                min={1}
                max={5}
                value={tagValues[cat.key] || 3}
                onChange={(e) =>
                  setTagValues({ ...tagValues, [cat.key]: +e.target.value })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{cat.min_label}</span>
                <span>{cat.max_label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 画像変更 */}
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">画像（変更する場合）</label>
          {imageUrl && !imageFile && (
            <img
              src={imageUrl}
              alt="preview"
              className="rounded w-full object-cover max-h-48"
            />
          )}
          {imageFile && (
            <img
              src={URL.createObjectURL(imageFile)}
              alt="new"
              className="rounded w-full object-cover max-h-48"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full border p-1 text-sm"
          />
        </div>

        {/* 操作ボタン */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-500">
            キャンセル
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
          >
            {loading ? "更新中..." : "更新"}
          </button>
        </div>
      </div>
    </div>
  );
}