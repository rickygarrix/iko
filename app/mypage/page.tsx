"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Image from "next/image"; // ← 追加！

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;

      setUser(data.user);
      setName(data.user.user_metadata?.name || "");
      setInstagram(data.user.user_metadata?.instagram || "");
      setAvatarUrl(data.user.user_metadata?.avatar_url || null);
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    const updates = {
      name,
      instagram,
      avatar_url: avatarUrl,
    };

    const { error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) {
      alert("更新に失敗しました");
    } else {
      alert("プロフィールを更新しました");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`${user.id}/${file.name}`, file, { upsert: true });

    if (error) {
      alert("画像のアップロードに失敗しました");
    } else {
      const url = supabase.storage.from("avatars").getPublicUrl(data.path).data.publicUrl;
      setAvatarUrl(url);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCF6] p-8">
      <h1 className="text-xl font-bold mb-6">マイページ</h1>

      <div className="space-y-6 max-w-md mx-auto">
        {/* アイコン画像 */}
        <div>
          <p className="font-semibold mb-2">アイコン</p>
          {avatarUrl && (
            <div className="relative w-24 h-24 mb-2">
              <Image
                src={avatarUrl}
                alt="Avatar"
                fill
                className="rounded-full object-cover"
                sizes="96px"
                unoptimized // 🔹 Supabaseの画像だから最適化不要
              />
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
        </div>

        {/* 名前 */}
        <div>
          <p className="font-semibold mb-2">名前</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="名前を入力"
          />
        </div>

        {/* Instagramリンク */}
        <div>
          <p className="font-semibold mb-2">Instagramリンク</p>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="https://instagram.com/your_id"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          保存する
        </button>
      </div>
    </div>
  );
}