"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/types/post";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function UserPage() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      const { data } = await supabase.from("user_profiles").select("*").eq("id", id).single();
      setUser(data);
    };

    const fetchPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select(
          `id, body, created_at, user_id,
          store:stores!posts_store_id_fkey(id, name),
          post_tag_values(value, tag_category:tag_categories(key, label, min_label, max_label))`
        )
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      const normalized: Post[] = (data ?? []).map((post: any) => ({
        id: post.id,
        body: post.body,
        created_at: post.created_at,
        user_id: post.user_id,
        store: post.store ? { id: post.store.id, name: post.store.name } : undefined,
        post_tag_values: post.post_tag_values.map((tag: any) => ({
          value: tag.value,
          tag_category: {
            key: tag.tag_category?.key ?? "",
            label: tag.tag_category?.label ?? "",
            min_label: tag.tag_category?.min_label ?? "",
            max_label: tag.tag_category?.max_label ?? "",
          },
        })),
      }));

      setPosts(normalized);
    };

    fetchUser();
    fetchPosts();
  }, [id]);

  if (!user) return <div className="min-h-screen p-8 pt-[80px]">ユーザーが見つかりません</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header locale="ja" messages={{ search: "検索", map: "地図" }} />

      <main className="flex-1 p-8 pt-[80px] max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-6">ユーザーページ</h1>

        {/* プロフィール */}
        <div className="space-y-6 mb-12">
          {user.avatar_url && (
            <div className="relative w-24 h-24">
              <Image
                src={user.avatar_url}
                alt="Avatar"
                fill
                className="rounded-full object-cover"
                sizes="96px"
                unoptimized
              />
            </div>
          )}

          <div>
            <p className="font-semibold">名前</p>
            <p>{user.name || "（未設定）"}</p>
          </div>

          <div>
            <p className="font-semibold">Instagram</p>
            {user.instagram ? (
              <a href={user.instagram} className="text-blue-600 underline" target="_blank">
                {user.instagram}
              </a>
            ) : (
              <p>（未設定）</p>
            )}
          </div>
        </div>

        {/* 投稿一覧 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">投稿</h2>
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
                      {tag.tag_category.label}：{tag.value}（
                      {tag.tag_category.min_label}〜{tag.tag_category.max_label}）
                    </p>
                  ))}
                </div>
                <small className="text-gray-500">
                  {new Date(post.created_at).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        </div>
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