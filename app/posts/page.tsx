"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

type Post = {
  id: string;
  body: string;
  image_url: string;
  created_at: string;
  post_likes: { id: string }[];
  post_tag_values: { tag_category_id: string; value: number }[];
};

type Store = {
  id: string;
  name: string;
};

export default function PostsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<string>("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tags, setTags] = useState<Record<string, number>>({}); // key: tag_category_id

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchPosts();
    fetchStores();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, post_likes(*), post_tag_values(*)")
      .eq("is_public", true)
      .order("created_at", { ascending: false });
    if (data) setPosts(data);
  };

  const fetchStores = async () => {
    const { data } = await supabase.from("stores").select("id, name");
    if (data) setStores(data);
  };

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

    const { data: insertedPosts, error } = await supabase.from("posts").insert([
      {
        user_id: user.id,
        store_id: storeId,
        body,
        image_url: imageUrl,
        is_public: true,
      },
    ]).select("id");

    if (insertedPosts && insertedPosts.length > 0) {
      const postId = insertedPosts[0].id;
      // タグを保存
      const tagInserts = Object.entries(tags).map(([tag_category_id, value]) => ({
        post_id: postId,
        tag_category_id,
        value,
      }));
      if (tagInserts.length > 0) {
        await supabase.from("post_tag_values").insert(tagInserts);
      }

      // リセット
      setBody("");
      setImage(null);
      setPreviewUrl(null);
      setTags({});
      setShowModal(false);
      fetchPosts();
    }

    setLoading(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    const { data: existing } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      await supabase.from("post_likes").delete().eq("id", existing.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
    }
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-[#FEFCF6] flex flex-col">
      <Header locale="ja" messages={{ search: "検索", map: "地図" }} />

      <main className="flex-1 pt-[80px] max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">投稿一覧</h1>
        {posts.length === 0 && <p>まだ投稿がありません</p>}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 shadow bg-white">
              {post.image_url && (
                <div className="relative w-full h-64 mb-4">
                  <Image src={post.image_url} alt="投稿画像" fill className="object-cover rounded" unoptimized />
                </div>
              )}
              <p className="mb-2 text-black">{post.body}</p>
              <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <button onClick={() => handleLike(post.id)} className="text-red-500">
                  ❤️ {post.post_likes?.length || 0} いいね
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 投稿ボタン */}
        <button
          onClick={() => router.push("/posts/new")}
          className="fixed bottom-60 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg text-2xl z-50"
        >
          ＋
        </button>

        {/* 投稿モーダル */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
              <h2 className="text-lg font-bold mb-4">新規投稿</h2>

              <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className="w-full border rounded p-2 mb-4 text-black">
                <option value="">店舗を選択</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="投稿内容を入力"
                className="w-full border border-gray-300 rounded p-2 mb-4 text-black"
              />
              <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />
              {previewUrl && <Image src={previewUrl} alt="preview" width={300} height={200} className="mb-4 rounded" />}

              {/* タグスライダー（仮実装） */}
              <p className="text-sm mb-2">雰囲気（1:おとなしめ～5:盛り上がり）</p>
              <input type="range" min="1" max="5" value={tags["mood"] || 3} onChange={(e) => setTags({ ...tags, mood: +e.target.value })} />

              <div className="flex justify-between mt-4">
                <button onClick={() => setShowModal(false)} className="text-gray-500">キャンセル</button>
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
        )}
      </main>

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