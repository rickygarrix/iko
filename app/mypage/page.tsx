"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import EditPostModal from "@/components/EditPostModal"; // ← 追記
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Post = {
  id: string;
  body: string;
  created_at: string;
  user_id: string; // ← ★追加
  store?: { id: string; name: string };
  post_tag_values?: {
    value: number;
    tag_category: {
      key: string;
      label: string;
      min_label: string;
      max_label: string;
    };
  }[];
};

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null); // ← 追記

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;

      setUser(data.user);
      setName(data.user.user_metadata?.name || "");
      setInstagram(data.user.user_metadata?.instagram || "");
      setAvatarUrl(data.user.user_metadata?.avatar_url || null);

      const { data: posts, error: postError } = await supabase
        .from("posts")
        .select(`
          id,
          body,
          created_at,
          store:stores!posts_store_id_fkey (
            id,
            name
          ),
          post_tag_values (
            value,
            tag_category:tag_categories (
              key,
              label,
              min_label,
              max_label
            )
          )
        `)
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });

      if (postError) {
        console.error("投稿取得エラー:", postError.message);
        return;
      }

      const enrichedPosts: Post[] = (posts ?? []).map((post: any) => {
        const store = Array.isArray(post.store) ? post.store[0] : post.store;
        return {
          ...post,
          store: store ? { id: store.id, name: store.name } : undefined,
          post_tag_values: post.post_tag_values?.map((tag: any) => {
            const cat = tag.tag_category || {};
            return {
              value: tag.value,
              tag_category: {
                key: String(cat.key ?? ""),
                label: String(cat.label ?? ""),
                min_label: String(cat.min_label ?? ""),
                max_label: String(cat.max_label ?? ""),
              },
            };
          }),
        };
      });

      setMyPosts(enrichedPosts);
    };

    fetchUserAndPosts();
  }, []);

  const handleSave = async () => {
    const updates = { name, instagram, avatar_url: avatarUrl };
    const { error } = await supabase.auth.updateUser({ data: updates });

    if (error) {
      alert("更新に失敗しました");
    } else {
      alert("プロフィールを更新しました");
      setIsEditing(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("この投稿を削除しますか？")) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      alert("削除に失敗しました");
      console.error(error);
    } else {
      // 再取得
      const updated = myPosts.filter((p) => p.id !== postId);
      setMyPosts(updated);
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
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header locale="ja" messages={{ search: "検索", map: "地図" }} />

      <main className="flex-1 p-8 pt-[80px]">
        <h1 className="text-xl font-bold mb-6">マイページ</h1>

        <div className="space-y-6 max-w-md mx-auto mb-12">
          {/* プロフィール編集 */}
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
                  unoptimized
                />
              </div>
            )}
            {isEditing && <input type="file" accept="image/*" onChange={handleAvatarChange} />}
          </div>

          <div>
            <p className="font-semibold mb-1">名前</p>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            ) : (
              <p>{name || "（未設定）"}</p>
            )}
          </div>

          <div>
            <p className="font-semibold mb-1">Instagram</p>
            {isEditing ? (
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            ) : (
              <p>
                {instagram ? (
                  <a href={instagram} className="text-blue-600 underline" target="_blank">
                    {instagram}
                  </a>
                ) : (
                  "（未設定）"
                )}
              </p>
            )}
          </div>

          {isEditing ? (
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                保存する
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 border border-gray-400 text-gray-600 py-2 rounded hover:bg-gray-100"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900"
            >
              編集する
            </button>
          )}
        </div>

        {/* 自分の投稿一覧 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">自分の投稿</h2>
          <ul className="space-y-4">
            {myPosts.map((post) => (
              <li key={post.id} className="bg-white border p-4 rounded shadow">
                <p className="text-sm text-gray-700 mb-1">
                  店舗：{post.store?.name ?? "（不明）"}
                </p>
                <p className="mb-2">{post.body}</p>
                <div className="text-sm text-gray-600 space-y-1 mb-2">
                  {post.post_tag_values?.map((tag) => (
                    <p key={tag.tag_category.key}>
                      {tag.tag_category.label}：{tag.value}（
                      {tag.tag_category.min_label}〜{tag.tag_category.max_label}）
                    </p>
                  ))}
                </div>

                {/* 編集・削除ボタン */}
                <div className="flex justify-end gap-4 text-sm text-blue-600 mt-2">
                  <button onClick={() => setEditingPost(post)}>編集</button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-500"
                  >
                    削除
                  </button>
                </div>

                <small className="text-gray-500">
                  {new Date(post.created_at).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {editingPost && (
        <EditPostModal
          post={editingPost}
          stores={[]} // 店舗編集しない場合は空配列でもOK
          tagCategories={[]} // 必要なら設定
          onClose={() => setEditingPost(null)}
          onUpdated={() => {
            setEditingPost(null);
            location.reload(); // or fetchUserAndPosts() を呼ぶようにしてもOK
          }}
        />
      )}

      <Footer
        locale="ja"
        messages={{
          search: "検索",
          map: "地図",
          contact: "お問い合わせ",
          terms: "利用規約",
          privacy: "プライバシー",
          copyright: "© 2025 Otonavi",
        }}
      />
    </div>
  );
}