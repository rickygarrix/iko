"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User } from "@supabase/supabase-js";
import NewPostModal from "@/components/NewPostModal";

type Post = {
  id: string;
  body: string;
  image_url: string;
  created_at: string;
  post_likes: { id: string }[];
  post_tag_values: { tag_category_id: string; value: number }[];
};

export default function PostsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, post_likes(*), post_tag_values(*)")
      .eq("is_public", true)
      .order("created_at", { ascending: false });
    if (data) setPosts(data);
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

        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-60 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg text-2xl z-50"
        >
          ＋
        </button>

        {showModal && (
          <NewPostModal
            onClose={() => setShowModal(false)}
            onPosted={fetchPosts}
          />
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