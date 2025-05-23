"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/types/post";

type Props = {
  post: Post;
  stores: Store[];
  tagCategories: TagCategory[];
  onClose: () => void;
  onUpdated: () => Promise<void>;
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

    try {
      let newImageUrl = imageUrl;

      // 画像アップロード処理
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${ext}`;
        const filePath = `${post.id}/${fileName}`;

        if (post.image_url) {
          const oldPath = post.image_url.split("/").slice(-2).join("/");
          await supabase.storage.from("post-images").remove([oldPath]);
        }

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, imageFile);

        if (uploadError) throw new Error("画像のアップロードに失敗しました");

        const { data: urlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);
        newImageUrl = urlData?.publicUrl || "";
      }

      // 投稿の本体情報を更新
      const { error: updateError } = await supabase
        .from("posts")
        .update({
          body,
          store_id: storeId,
          image_url: newImageUrl,
        })
        .eq("id", post.id);

      if (updateError) throw new Error("投稿の更新に失敗しました");

      // タグ削除（即時整合性のため delay）
      await supabase.from("post_tag_values").delete().eq("post_id", post.id);
      await new Promise((res) => setTimeout(res, 300));

      // タグの upsert
      const tagInserts = Object.entries(tagValues)
        .map(([key, value]) => {
          const cat = tagCategories.find((c) => c.key === key);
          if (!cat) return null;
          return {
            post_id: post.id,
            tag_category_id: cat.id,
            value,
          };
        })
        .filter(
          (item): item is { post_id: string; tag_category_id: string; value: number } => !!item
        );

      const seen = new Set<string>();
      const filtered = tagInserts.filter((item) => {
        const key = `${item.post_id}_${item.tag_category_id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (filtered.length > 0) {
        const { error: upsertError } = await supabase
          .from("post_tag_values")
          .upsert(filtered, {
            onConflict: "post_id,tag_category_id", // ← カンマ区切りで文字列
          });

        if (upsertError) throw new Error("タグの更新に失敗しました");
      }

      await onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message || "更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold">投稿を編集</h2>

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

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border p-2 rounded"
          rows={3}
        />

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