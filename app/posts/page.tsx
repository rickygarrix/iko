"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import NewPostModal from "@/components/NewPostModal";
import EditPostModal from "@/components/EditPostModal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Store = { id: string; name: string };

type TagCategory = {
  id: string;
  key: string;
  label: string;
  min_label: string;
  max_label: string;
};

type Post = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  image_url?: string | null;
  store?: { id: string; name: string };
  post_likes?: { user_id: string }[];
  user?: { id: string; name?: string; avatar_url?: string } | null;
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

export default function StorePostPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [tagCategories, setTagCategories] = useState<TagCategory[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followings, setFollowings] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const router = useRouter();
  const [reportedPostIds, setReportedPostIds] = useState<string[]>([]);
  const handleCloseEdit = () => setEditingPost(null);

  useEffect(() => {
    const initialize = async () => {
      const { data } = await supabase.auth.getUser();
      const loggedInUser = data.user;
      setUser(loggedInUser);

      if (loggedInUser) {
        fetchFollowings(loggedInUser.id);
        fetchReportedPosts(loggedInUser.id);
      }

      fetchStores();
      fetchTagCategories();
      fetchPosts();
    };

    initialize();
  }, []);

  const fetchFollowings = async (userId: string) => {
    const { data } = await supabase
      .from("user_follows")
      .select("following_id")
      .eq("follower_id", userId);
    if (data) setFollowings(data.map((f) => f.following_id));
  };

  const fetchReportedPosts = async (userId: string) => {
    const { data } = await supabase
      .from("reports")
      .select("post_id")
      .eq("reporter_id", userId);
    if (data) setReportedPostIds(data.map((r) => r.post_id));
  };

  const fetchStores = async () => {
    const { data } = await supabase.from("stores").select("id, name");
    if (data) setStores(data);
  };

  const fetchTagCategories = async () => {
    const { data } = await supabase.from("tag_categories").select("*");
    if (data) setTagCategories(data);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id, body, created_at, user_id, image_url,
        store:stores!posts_store_id_fkey(id, name),
        post_likes(user_id),
        user:user_profiles(id, name, avatar_url),
        post_tag_values(value, tag_category:tag_categories(key, label, min_label, max_label))
      `)
      .eq("is_public", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("投稿取得エラー:", error.message);
      return;
    }

    const enrichedPosts: Post[] = data.map((post: any) => ({
      ...post,
      user: post.user ?? {
        id: post.user_id,
        name: "退会ユーザー",
        avatar_url: "/default-avatar.svg",
      },
      store: post.store ?? undefined,
      post_tag_values: post.post_tag_values?.map((tag: any) => ({
        value: tag.value,
        tag_category: tag.tag_category,
      })) ?? [],
    }));

    setPosts(enrichedPosts);
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("この投稿を削除しますか？")) return;
    await supabase.from("posts").delete().eq("id", postId);
    fetchPosts();
  };

  const handleReportPost = async (postId: string) => {
    if (!user) return alert("ログインしてください");
    if (!window.confirm("この投稿を運営に通報しますか？")) return;

    const { error } = await supabase.from("reports").insert({
      post_id: postId,
      reporter_id: user.id,
      reason: "",
    });

    if (error) {
      console.error("通報エラー:", error.message);
      alert("通報に失敗しました");
    } else {
      setReportedPostIds((prev) => [...prev, postId]);
      alert("通報しました。ご協力ありがとうございます。");
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    const post = posts.find((p) => p.id === postId);
    const alreadyLiked = post?.post_likes?.some((l) => l.user_id === user.id);

    if (alreadyLiked) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
    }

    fetchPosts();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale="ja" messages={{ search: "検索", map: "地図" }} />
      <main className="flex-1 pt-6 px-4 sm:px-6 relative">
        <button
          onClick={() => {
            if (!user) return alert("ログインしてください");
            setShowModal(true);
          }}
          className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg text-2xl z-50"
        >
          ＋
        </button>

        {showModal && user && (
          <NewPostModal
            stores={stores}
            tagCategories={tagCategories}
            user={user}
            onClose={() => setShowModal(false)}
            onPosted={fetchPosts}
          />
        )}

        {editingPost && (
          <EditPostModal
            post={editingPost}
            stores={stores}
            tagCategories={tagCategories}
            onClose={handleCloseEdit}
            onUpdated={async () => {
              await fetchPosts();
              handleCloseEdit();
            }}
          />
        )}

        <h2 className="text-lg font-semibold mt-8 text-center">投稿一覧</h2>

        <ul className="mt-4 mb-16 flex flex-col items-center space-y-6">
          {posts.map((post) => (
            <li key={post.id} className="bg-white border p-4 rounded shadow w-full max-w-[700px]">
              {post.image_url && (
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={post.image_url}
                    alt="投稿画像"
                    fill
                    className="object-cover rounded"
                    sizes="100vw"
                    unoptimized
                  />
                </div>
              )}

              <div
                className="flex items-center gap-3 mb-2 cursor-pointer"
                onClick={() => {
                  if (post.user && user?.id !== post.user.id) {
                    router.push(`/users/${post.user.id}`);
                  }
                }}
              >
                <Image
                  src={post.user?.avatar_url || "/default-avatar.svg"}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="rounded-full aspect-square object-cover"
                />
                <span className="text-sm text-gray-700">{post.user?.name || "退会ユーザー"}</span>
              </div>

              <p
                className="text-sm text-gray-700 mb-1 cursor-pointer hover:underline"
                onClick={() => router.push(`/stores/${post.store?.id}`)}
              >
                店舗：{post.store?.name ?? "（不明）"}
              </p>

              <p className="mb-2">{post.body}</p>

              <div className="text-sm text-gray-600 space-y-1 mb-2">
                {post.post_tag_values?.map((tag, i) => (
                  <p key={`${tag.tag_category.key}-${i}`}>
                    {tag.tag_category.label}：{tag.value}（{tag.tag_category.min_label}〜{tag.tag_category.max_label}）
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between text-gray-500 text-xs mt-2">
                <small>{new Date(post.created_at).toLocaleString()}</small>
                <div className="flex items-center gap-4">
                  {user?.id === post.user_id ? (
                    <>
                      <button onClick={() => setEditingPost(post)} className="text-green-600 hover:underline">
                        編集
                      </button>
                      <button onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:underline">
                        削除
                      </button>
                    </>
                  ) : reportedPostIds.includes(post.id) ? (
                    <span className="text-red-400 text-sm">🚨 通報済み</span>
                  ) : (
                    <button onClick={() => handleReportPost(post.id)} className="text-red-600 hover:underline">
                      通報
                    </button>
                  )}
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`text-sm ${post.post_likes?.some((like) => like.user_id === user?.id)
                      ? "text-blue-600"
                      : "text-gray-500"
                      }`}
                  >
                    ♥ いいね {post.post_likes?.length ?? 0}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
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