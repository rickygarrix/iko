"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import NewPostModal from "@/components/NewPostModal";
import EditPostModal from "@/components/EditPostModal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FollowButton from "@/components/FollowButton";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";

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
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [savingPostIds, setSavingPostIds] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      const { data } = await supabase.auth.getUser();
      const loggedInUser = data.user;
      setUser(loggedInUser);

      if (loggedInUser) {
        await supabase.from("user_profiles").upsert({
          id: loggedInUser.id,
          name: loggedInUser.user_metadata?.name,
          avatar_url: loggedInUser.user_metadata?.avatar_url,
        });

        fetchFollowings(loggedInUser.id);
        fetchSavedPosts(loggedInUser.id);
      }

      fetchStores();
      fetchTagCategories();
      fetchPosts();
    };

    initialize();
  }, []);

  const fetchFollowings = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_follows")
      .select("following_id")
      .eq("follower_id", userId);
    if (!error && data) setFollowings(data.map((f) => f.following_id));
  };

  const fetchSavedPosts = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_saved_posts")
      .select("post_id")
      .eq("user_id", userId);
    if (!error && data) setSavedPosts(data.map((d) => d.post_id));
  };

  const toggleSavePost = async (postId: string) => {
    if (!user) {
      alert("ログインしてください");
      return;
    }

    const alreadySaved = savedPosts.includes(postId);
    setSavingPostIds((prev) => [...prev, postId]);

    try {
      if (alreadySaved) {
        const { error } = await supabase
          .from("user_saved_posts")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);

        if (!error) {
          setSavedPosts((prev) => prev.filter((id) => id !== postId));
        } else {
          console.error("削除エラー:", error.message);
        }
      } else {
        // ✅ 重複INSERTを防ぐために `upsert` を使用
        const { error } = await supabase
          .from("user_saved_posts")
          .upsert(
            { user_id: user.id, post_id: postId },
            { onConflict: "user_id, post_id" }
          );

        if (!error) {
          setSavedPosts((prev) => [...prev, postId]);
        } else {
          console.error("保存エラー:", error.message);
        }
      }
    } catch (e) {
      console.error("例外エラー:", e);
    } finally {
      setSavingPostIds((prev) => prev.filter((id) => id !== postId));
    }
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
        id,
        body,
        created_at,
        user_id,
        store:stores!posts_store_id_fkey(id, name),
        post_likes(user_id),
        post_tag_values(value, tag_category:tag_categories(key, label, min_label, max_label))
      `)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error || !data) return console.error("投稿取得エラー:", error?.message);

    const userIds = [...new Set(data.map((p) => p.user_id))];
    const { data: users } = await supabase
      .from("user_profiles")
      .select("id, name, avatar_url")
      .in("id", userIds);

    const enrichedPosts: Post[] = data.map((post: any) => {
      const matchedUser = users?.find((u) => u.id === post.user_id);
      return {
        ...post,
        store: post.store ?? undefined,
        user: matchedUser ?? undefined,
        post_tag_values: post.post_tag_values?.map((tag: any) => ({
          value: tag.value,
          tag_category: tag.tag_category,
        })),
      };
    });

    setPosts(enrichedPosts);
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("この投稿を削除しますか？")) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (!error) fetchPosts();
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

  const filteredPosts = showFollowedOnly
    ? posts.filter((post) => followings.includes(post.user_id))
    : posts;

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale="ja" messages={{ search: "検索", map: "地図" }} />
      <main className="flex-1 pt-6 px-4 sm:px-6 relative">
        <button
          onClick={() => {
            if (!user) {
              alert("ログインしてください");
              return;
            }
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
            onClose={() => setEditingPost(null)}
            onUpdated={fetchPosts}
          />
        )}

        <h2 className="text-lg font-semibold mt-8 text-center">投稿一覧</h2>

        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={() => setShowFollowedOnly(false)}
            className={`px-3 py-1 border rounded ${!showFollowedOnly ? "bg-blue-600 text-white" : "bg-white text-blue-600"}`}
          >
            全体
          </button>
          <button
            onClick={() => setShowFollowedOnly(true)}
            className={`px-3 py-1 border rounded ${showFollowedOnly ? "bg-blue-600 text-white" : "bg-white text-blue-600"}`}
          >
            フォロー中
          </button>
        </div>

        <ul className="mt-4 mb-16 flex flex-col items-center space-y-6">
          {filteredPosts.map((post) => (
            <li key={post.id} className="bg-white border p-4 rounded shadow w-full max-w-[700px]">
              <div className="flex items-center gap-3 mb-2">
                {post.user?.avatar_url && (
                  <img
                    src={post.user.avatar_url}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover cursor-pointer"
                    onClick={() => {
                      if (user?.id !== post.user?.id) {
                        router.push(`/users/${post.user?.id}`);
                      }
                    }}
                  />
                )}
                <div className="flex items-center gap-2">
                  <p
                    onClick={() => {
                      if (user?.id !== post.user?.id) {
                        router.push(`/users/${post.user?.id}`);
                      }
                    }}
                    className={`text-sm font-semibold text-gray-800 ${user?.id !== post.user?.id ? "cursor-pointer hover:underline" : "text-gray-800"
                      }`}
                  >
                    {post.user?.name ?? "匿名ユーザー"}
                  </p>
                  {user && post.user && user.id !== post.user.id && (
                    <FollowButton
                      currentUserId={user.id}
                      targetUserId={post.user.id}
                      onFollowChange={() => fetchFollowings(user.id)}
                    />
                  )}
                </div>
              </div>

              <p
                className="text-sm text-gray-700 mb-1 cursor-pointer hover:underline"
                onClick={() => router.push(`/stores/${post.store?.id}`)}
              >
                店舗：{post.store?.name ?? "（不明）"}
              </p>
              <p className="mb-2">{post.body}</p>
              <div className="text-sm text-gray-600 space-y-1 mb-2">
                {post.post_tag_values?.map((tag) => (
                  <p key={tag.tag_category.key}>
                    {tag.tag_category.label}：{tag.value}（{tag.tag_category.min_label}〜{tag.tag_category.max_label}）
                  </p>
                ))}
              </div>
              <div className="flex items-center justify-between text-gray-500 text-xs mt-2">
                <small>{new Date(post.created_at).toLocaleString()}</small>
                <div className="flex items-center gap-4">
                  {user?.id === post.user_id && (
                    <>
                      <button
                        onClick={() => setEditingPost(post)}
                        className="text-green-600 hover:underline"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-500 hover:underline"
                      >
                        削除
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`text-sm ${post.post_likes?.some((like) => like.user_id === user?.id)
                      ? "text-blue-600"
                      : "text-gray-500"}`}
                  >
                    ♥ いいね {post.post_likes?.length ?? 0}
                  </button>
                  <button
                    onClick={() => toggleSavePost(post.id)}
                    // ✅ 検証用にこの行を一度コメントアウト
                    // disabled={savingPostIds.includes(post.id)}
                    className={`flex items-center text-sm gap-1 transition-colors duration-150 ${savedPosts.includes(post.id)
                      ? "text-yellow-500"
                      : "text-gray-400 hover:text-yellow-500"}`}
                  >
                    {savedPosts.includes(post.id) ? (
                      <BookmarkCheck size={18} className="transition-transform duration-150" />
                    ) : (
                      <Bookmark size={18} className="transition-transform duration-150" />
                    )}
                    <span className="select-none">保存</span>
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