"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function PostsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState("");

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data: posts } = await supabase.from("posts").select("*, comments(*), likes(*)").order("created_at", { ascending: false });
    setPosts(posts || []);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!content) return;
    setLoading(true);
    let imageUrl = "";

    if (image) {
      const filePath = `posts/${uuidv4()}`;
      const { data, error } = await supabase.storage.from("post_images").upload(filePath, image);
      if (!error) {
        imageUrl = supabase.storage.from("post_images").getPublicUrl(filePath).data.publicUrl;
      }
    }

    const { error } = await supabase.from("posts").insert([{ content, image_url: imageUrl, user_id: user?.id }]);
    if (!error) {
      setContent("");
      setImage(null);
      setPreviewUrl(null);
      setShowModal(false);
      fetchPosts();
    }
    setLoading(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    const existing = await supabase.from("likes").select("*").eq("post_id", postId).eq("user_id", user.id).single();
    if (existing.data) {
      await supabase.from("likes").delete().eq("id", existing.data.id);
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
    }
    fetchPosts();
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!commentText.trim() || !user) return;
    await supabase.from("comments").insert({ post_id: postId, user_id: user.id, content: commentText });
    setCommentText("");
    setShowCommentModal(null);
    fetchPosts();
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
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
            <p className="mb-2 text-black">{post.content}</p>
            <p className="text-sm text-gray-500">
              @{post.user_name || "匿名"} - {new Date(post.created_at).toLocaleString()}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <button onClick={() => handleLike(post.id)} className="text-red-500">
                ❤️ {post.likes?.length || 0} いいね
              </button>
              <button onClick={() => setShowCommentModal(post.id)} className="text-blue-600">
                💬 コメント
              </button>
            </div>

            {showCommentModal === post.id && (
              <div className="mt-4 bg-gray-100 p-4 rounded">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="コメントを書く"
                  className="w-full border rounded p-2 mb-2"
                />
                <div className="text-right">
                  <button onClick={() => handleCommentSubmit(post.id)} className="text-sm text-white bg-blue-600 px-3 py-1 rounded">
                    投稿
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 投稿ボタン */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg text-2xl"
      >
        ＋
      </button>

      {/* 投稿モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">新規投稿</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="投稿内容を入力"
              className="w-full border border-gray-300 rounded p-2 mb-4 text-black"
            />
            <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />
            {previewUrl && <Image src={previewUrl} alt="preview" width={300} height={200} className="mb-4 rounded" />}
            <div className="flex justify-between">
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
  );
}
