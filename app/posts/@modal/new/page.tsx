"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { User } from "@supabase/supabase-js";

export default function NewPostModal() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [storeId, setStoreId] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.from("stores").select("id, name").then(({ data }) => {
      if (data) setStores(data);
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!body || !storeId || !user) return;
    setLoading(true);

    let imageUrl = "";
    if (image) {
      const path = `posts/${uuidv4()}`;
      const { error } = await supabase.storage.from("post_images").upload(path, image);
      if (!error) {
        imageUrl = supabase.storage.from("post_images").getPublicUrl(path).data.publicUrl;
      }
    }

    const { error } = await supabase.from("posts").insert([
      {
        user_id: user.id,
        store_id: storeId,
        body,
        image_url: imageUrl,
        is_public: true,
      },
    ]);

    if (!error) {
      router.back(); // 成功後はモーダルを閉じる（前の画面に戻る）
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold mb-4">新規投稿</h2>

        <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className="w-full border rounded p-2 mb-4 text-black">
          <option value="">店舗を選択</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="投稿内容を入力"
          className="w-full border rounded p-2 mb-4 text-black"
        />
        <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />
        {previewUrl && <Image src={previewUrl} alt="preview" width={300} height={200} className="mb-4 rounded" />}

        <div className="flex justify-between">
          <button onClick={() => router.back()} className="text-gray-500">キャンセル</button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "投稿中..." : "投稿する"}
          </button>
        </div>
      </div>
    </div>
  );
}