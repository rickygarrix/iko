"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import NewPostModal from "@/components/NewPostModal";
import EditPostModal from "@/components/EditPostModal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Store = {
  id: string;
  name: string;
};

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
  user?: {
    id: string;
    name?: string;
    avatar_url?: string;
  } | null;
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
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const loggedInUser = data.user;
      setUser(loggedInUser);

      if (loggedInUser) {
        await supabase.from("users").upsert({
          id: loggedInUser.id,
          name: loggedInUser.user_metadata?.name,
          avatar_url: loggedInUser.user_metadata?.avatar_url,
        });
      }

      fetchStores();
      fetchTagCategories();
      fetchPosts();
    });
  }, []);

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
        store_id,
        store:stores!posts_store_id_fkey (id, name),
        post_likes (user_id),
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
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("投稿取得エラー:", error.message);
      return;
    }

    const userIds = [...new Set(data.map((p) => p.user_id))];
    const { data: users } = await supabase
      .from("users")
      .select("id, name, avatar_url")
      .in("id", userIds);

    const enrichedPosts: Post[] = data.map((post: any) => {
      const matchedUser = users?.find((u) => u.id === post.user_id);

      return {
        ...post,
        store: post.store
          ? {
            id: post.store.id,
            name: post.store.name,
          }
          : undefined,
        user: matchedUser
          ? {
            id: matchedUser.id,
            name: matchedUser.name ?? "匿名",
            avatar_url: matchedUser.avatar_url ?? "",
          }
          : undefined,
        post_tag_values: post.post_tag_values?.map((tag: any) => {
          const cat = tag.tag_category;
          return {
            value: tag.value,
            tag_category: {
              key: String(cat?.key ?? ""),
              label: String(cat?.label ?? ""),
              min_label: String(cat?.min_label ?? ""),
              max_label: String(cat?.max_label ?? ""),
            },
          };
        }),
      };
    });

    setPosts(enrichedPosts);
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("この投稿を削除しますか？")) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      alert("削除に失敗しました");
      console.error(error);
    } else {
      fetchPosts();
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    const post = posts.find((p) => p.id === postId);
    const alreadyLiked = post?.post_likes?.some((l) => l.user_id === user.id);

    if (alreadyLiked) {
      await supabase.from("post_likes").delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: user.id,
      });
    }

    fetchPosts();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale="ja" messages={{ search: "検索", map: "地図" }} />

      <main className="flex-1 pt-6 px-4 sm:px-6 relative">
        <button
          onClick={() => setShowModal(true)}
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
        <ul className="mt-4 mb-16 flex flex-col items-center space-y-6">
          {posts.map((post) => (
            <li
              key={post.id}
              className="bg-white border p-4 rounded shadow w-full max-w-[700px]"
            >
              <div className="flex items-center gap-3 mb-2">
                {post.user?.avatar_url && (
                  <img
                    src={post.user.avatar_url}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <p className="text-sm font-semibold text-gray-800">
                  {post.user?.name ?? "匿名ユーザー"}
                </p>
              </div>

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