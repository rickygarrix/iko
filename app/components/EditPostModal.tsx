"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

export type Post = {
  id: string;
  body: string;
  image_url: string;
};

type Props = {
  post: Post;
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditPostModal({ post, onClose, onUpdated }: Props) {
  const [body, setBody] = useState(post.body);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(post.image_url || null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  const handleUpdate = async () => {
    setLoading(true);
    let imageUrl = post.image_url;

    if (image) {
      const path = `posts/${uuidv4()}`;
      const { error } = await supabase.storage.from("post_images").upload(path, image, {
        cacheControl: "3600",
        upsert: true,
      });
      if (!error) {
        imageUrl = supabase.storage.from("post_images").getPublicUrl(path).data.publicUrl;
      }
    } else if (!previewUrl) {
      imageUrl = "";
    }

    await supabase
      .from("posts")
      .update({ body, image_url: imageUrl })
      .eq("id", post.id);

    onUpdated();
    onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 overflow-y-auto p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold mb-4">投稿を編集</h2>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="投稿内容を入力"
          className="w-full border rounded p-2 mb-4 text-black"
          rows={4}
        />
        <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
        {previewUrl && (
          <div className="mb-4 relative">
            <Image src={previewUrl} alt="preview" width={300} height={200} className="rounded" />
            <button
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-white border rounded px-2 py-1 text-xs"
            >
              削除
            </button>
          </div>
        )}
        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="text-gray-500">
            キャンセル
          </button>
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "更新中..." : "更新する"}
          </button>
        </div>
      </div>
    </div>
  );
}