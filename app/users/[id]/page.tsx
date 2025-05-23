"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import type { Post } from "@/types/post";
import type { Store } from "@/types/store";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: "",
    avatar_url: null,
    instagram: null,
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [storeFollows, setStoreFollows] = useState<Store[]>([]);
  const [receivedLikeCount, setReceivedLikeCount] = useState(0);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchUserProfile = async () => {
      // ユーザー情報
      const { data: user } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (user) {
        setUserData({
          name: user.name ?? "",
          avatar_url: user.avatar_url ?? null,
          instagram: user.instagram ?? null,
        });
      }

      // 投稿取得
      const { data: postsRaw, error: postError } = await supabase
        .from("posts")
        .select(`
          id, body, created_at, user_id, image_url,
          store:stores!posts_store_id_fkey(id, name),
          post_tag_values(value, tag_category:tag_categories(key, label, min_label, max_label))
        `)
        .eq("user_id", id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!postError && postsRaw) {
        const normalized: Post[] = postsRaw.map((p: any) => ({
          id: p.id,
          body: p.body,
          created_at: p.created_at,
          user_id: p.user_id,
          image_url: p.image_url ?? null,
          store: Array.isArray(p.store) ? p.store[0] : p.store,
          post_tag_values: (p.post_tag_values ?? []).map((tag: any) => ({
            value: tag.value,
            tag_category: tag.tag_category,
          })),
        }));
        setPosts(normalized);

        // もらったいいね数
        const postIds = normalized.map((p) => p.id);
        const { data: likes } = await supabase
          .from("post_likes")
          .select("*")
          .in("post_id", postIds);
        setReceivedLikeCount(likes?.length ?? 0);
      }

      // フォロー中の店舗
      const { data: follows } = await supabase
        .from("store_follows")
        .select("store:stores(id, name)")
        .eq("user_id", id);

      if (follows) {
        const stores: Store[] = follows.map((f: any) => f.store);
        setStoreFollows(stores);
      }
    };

    fetchUserProfile();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#FEFCF6]">
      <Header locale="ja" messages={{ search: "検索", map: "地図" }} />
      <main className="px-4 py-8 pt-[80px] max-w-3xl mx-auto">
        <h1 className="text-xl font-bold mb-6">{userData.name} さんのマイページ</h1>

        <div className="space-y-6 max-w-md mx-auto mb-8">
          {userData.avatar_url && (
            <div className="relative w-24 h-24">
              <Image
                src={userData.avatar_url}
                alt="Avatar"
                fill
                className="rounded-full object-cover"
                sizes="96px"
                unoptimized
              />
            </div>
          )}
          <div>
            <p className="font-semibold mb-1">Instagram</p>
            {userData.instagram ? (
              <a
                href={userData.instagram}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {userData.instagram}
              </a>
            ) : (
              <p className="text-gray-600">（未設定）</p>
            )}
          </div>
          <div className="flex gap-6 text-sm text-gray-700">
            <div>
              <span className="font-bold">{posts.length}</span> 投稿
            </div>
            <div>
              <span className="font-bold">{receivedLikeCount}</span> もらったいいね
            </div>
            <div>
              <span className="font-bold">{storeFollows.length}</span> フォロー中の店舗
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-2">フォロー中の店舗</h2>
          {storeFollows.length === 0 ? (
            <p className="text-gray-600">フォロー中の店舗はありません。</p>
          ) : (
            <ul className="space-y-2">
              {storeFollows.map((store) => (
                <li
                  key={store.id}
                  className="border p-3 rounded bg-white text-blue-600 hover:underline cursor-pointer"
                  onClick={() => router.push(`/stores/${store.id}`)}
                >
                  {store.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <h2 className="text-lg font-semibold mb-4">投稿一覧</h2>
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="bg-white border p-4 rounded shadow">
              <p className="text-sm text-gray-700 mb-1">
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
              <small className="text-gray-500">
                {new Date(post.created_at).toLocaleString()}
              </small>
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
