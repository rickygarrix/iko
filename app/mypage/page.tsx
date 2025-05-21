"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Post } from "@/types/post";
import type { Store } from "@/types/store";
import Image from "next/image";
import EditPostModal from "@/components/EditPostModal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [storeFollows, setStoreFollows] = useState<Store[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [nameError, setNameError] = useState("");
  const [postCount, setPostCount] = useState(0);
  const [receivedLikeCount, setReceivedLikeCount] = useState(0);
  const router = useRouter();

  // 投稿数
  const fetchPosts = async (userId: string) => {
    const { data: posts } = await supabase
      .from("posts")
      .select(`id, body, created_at, user_id, store:stores!posts_store_id_fkey(id, name), post_tag_values(value, tag_category:tag_categories(key, label, min_label, max_label))`)
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    const normalized: Post[] = (posts ?? []).map((post: any) => ({
      id: post.id,
      body: post.body,
      created_at: post.created_at,
      user_id: post.user_id,
      store: Array.isArray(post.store) ? post.store[0] : post.store,
      post_tag_values: (post.post_tag_values ?? []).map((tag: any) => ({
        value: tag.value,
        tag_category: {
          key: tag.tag_category?.key ?? "",
          label: tag.tag_category?.label ?? "",
          min_label: tag.tag_category?.min_label ?? "",
          max_label: tag.tag_category?.max_label ?? "",
        },
      })),
    }));

    setMyPosts(normalized);
    setPostCount(normalized.length);
  };

  // いいねした投稿
  const fetchLikedPosts = async (userId: string) => {
    const { data: likes, error } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", userId);

    if (error) return;

    const postIds = likes?.map((l) => l.post_id);
    if (!postIds?.length) {
      setLikedPosts([]);
      return;
    }

    const { data: posts } = await supabase
      .from("posts")
      .select(`id, body, created_at, user_id, store:stores!posts_store_id_fkey(id, name), post_tag_values(value, tag_category:tag_categories(key, label, min_label, max_label))`)
      .in("id", postIds)
      .eq("is_active", true);

    const normalized: Post[] = (posts ?? []).map((post: any) => ({
      id: post.id,
      body: post.body,
      created_at: post.created_at,
      user_id: post.user_id,
      store: Array.isArray(post.store) ? post.store[0] : post.store,
      post_tag_values: (post.post_tag_values ?? []).map((tag: any) => ({
        value: tag.value,
        tag_category: {
          key: tag.tag_category?.key ?? "",
          label: tag.tag_category?.label ?? "",
          min_label: tag.tag_category?.min_label ?? "",
          max_label: tag.tag_category?.max_label ?? "",
        },
      })),
    }));

    setLikedPosts(normalized);
  };

  // 自分の投稿に対するもらったいいね数
  const fetchReceivedLikes = async (userId: string) => {
    const { data: posts } = await supabase
      .from("posts")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (!posts || posts.length === 0) {
      setReceivedLikeCount(0);
      return;
    }

    const postIds = posts.map((p) => p.id);

    const { data: likes } = await supabase
      .from("post_likes")
      .select("*")
      .in("post_id", postIds);

    setReceivedLikeCount(likes?.length ?? 0);
  };

  // フォロー中の店舗
  const fetchFollowedStores = async (userId: string) => {
    const { data, error } = await supabase
      .from("store_follows")
      .select("store:stores(id, name)")
      .eq("user_id", userId);

    if (!error && data) {
      const stores: Store[] = data.map((f: any) => f.store);
      setStoreFollows(stores);
    }
  };

  // メインロジック
  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: supaUser } = await supabase.auth.getUser();
      const supa = supaUser?.user;
      const sessionUser = session?.user;

      if (!supa && !sessionUser) return;

      const activeUserId = supa?.id ?? sessionUser?.id ?? "";

      const fallbackUser: User = supa ?? {
        id: activeUserId,
        aud: "authenticated",
        role: "authenticated",
        email: sessionUser?.email ?? "",
        user_metadata: {
          name: sessionUser?.name ?? "",
          avatar_url: sessionUser?.image ?? "",
        },
        app_metadata: { provider: "line" },
        created_at: "",
      };

      setUser(fallbackUser);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", activeUserId)
        .single();

      if (profile) {
        setName(profile.name || "");
        setInstagram(profile.instagram || "");
        setAvatarUrl(profile.avatar_url || null);
      } else {
        setName(fallbackUser.user_metadata?.name || "");
        setInstagram("");
        setAvatarUrl(fallbackUser.user_metadata?.avatar_url || null);
      }

      await fetchPosts(activeUserId);
      await fetchLikedPosts(activeUserId);
      await fetchReceivedLikes(activeUserId);
      await fetchFollowedStores(activeUserId);
    };

    fetchUserAndData();
  }, [session]);

  const handleDeletePost = async (postId: string) => {
    if (!confirm("この投稿を削除しますか？")) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (!error) {
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };


  return (
    <div className="min-h-screen bg-[#FEFCF6]">
      <Header locale="ja" messages={{ search: "検索", map: "地図" }} />
      <main className="px-4 py-8 pt-[80px] max-w-3xl mx-auto">
        <h1 className="text-xl font-bold mb-6">マイページ</h1>



        {/* プロフィール編集 */}
        <div className="space-y-6 max-w-md mx-auto mb-12">
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
            {isEditing && <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file || !user) return;

              const ext = file.name.split(".").pop();
              const fileName = `${Date.now()}.${ext}`;
              const filePath = `${user.id}/${fileName}`;

              supabase.storage
                .from("avatars")
                .upload(filePath, file, { upsert: true })
                .then(({ data, error }) => {
                  if (error || !data) {
                    console.error("Upload error:", error);
                    alert("画像のアップロードに失敗しました");
                    return;
                  }
                  const {
                    data: { publicUrl },
                  } = supabase.storage.from("avatars").getPublicUrl(filePath);
                  setAvatarUrl(publicUrl);
                });
            }} />}
          </div>

          <div>
            <p className="font-semibold mb-1">名前</p>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
              </>
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

          <div className="mb-6 text-sm text-gray-700 flex gap-4">
            <div>
              <span className="font-bold">{postCount}</span> 投稿
            </div>
            <div>
              <span className="font-bold">{receivedLikeCount}</span> もらったいいね
            </div>
            <div>
              <span className="font-bold">{storeFollows.length}</span> フォロー中の店舗
            </div>
          </div>

          {isEditing ? (
            <div className="flex gap-4">
              <button
                onClick={async () => {
                  if (!name.trim()) {
                    setNameError("名前を入力してください");
                    return;
                  }
                  const updates = {
                    id: user?.id,
                    name,
                    instagram,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString(),
                  };
                  const { error } = await supabase.from("user_profiles").upsert(updates);
                  if (error) {
                    alert("更新に失敗しました");
                    console.error(error);
                  } else {
                    alert("プロフィールを更新しました");
                    setIsEditing(false);
                  }
                }}
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
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900"
              >
                編集する
              </button>
              <div className="text-right mt-2">
                <button
                  onClick={() => router.push("/withdrawal")}
                  className="text-sm text-red-500 underline hover:text-red-600"
                >
                  退会はこちら
                </button>
              </div>
            </>
          )}
        </div>

        {/* フォロー中の店舗セクション */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-2">フォロー中の店舗</h2>
          {storeFollows.length === 0 ? (
            <p className="text-gray-600">フォロー中の店舗はありません。</p>
          ) : (
            <ul className="space-y-2">
              {storeFollows.map((store) => (
                <li key={store.id} className="border p-3 rounded bg-white">
                  {store.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 自分の投稿 */}
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
              <div className="flex justify-end gap-4 text-sm text-blue-600 mt-2">
                <button onClick={() => setEditingPost(post)}>編集</button>
                <button onClick={() => handleDeletePost(post.id)} className="text-red-500">削除</button>
              </div>
              <small className="text-gray-500">{new Date(post.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>

        {/* いいねした投稿 */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">いいねした投稿</h2>
          {likedPosts.length === 0 ? (
            <p className="text-gray-600">いいねした投稿はありません。</p>
          ) : (
            <ul className="space-y-4">
              {likedPosts.map((post) => (
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
                  <small className="text-gray-500">{new Date(post.created_at).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        {editingPost && (
          <EditPostModal
            post={editingPost}
            stores={[]}
            tagCategories={[]}
            onClose={() => setEditingPost(null)}
            onUpdated={() => {
              setEditingPost(null);
              location.reload();
            }}
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