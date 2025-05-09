"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import NewPostModal from "@/components/NewPostModal";
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
  store?: { name: string };
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchStores();
    fetchTagCategories();
    fetchPosts();
  }, []);

  const fetchStores = async () => {
    const { data, error } = await supabase.from("stores").select("id, name");
    if (!error && data) setStores(data);
  };

  const fetchTagCategories = async () => {
    const { data, error } = await supabase.from("tag_categories").select("*");
    if (!error && data) setTagCategories(data);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        body,
        created_at,
        store:stores ( name ),
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

    if (!error && data) {
      setPosts(data as unknown as Post[]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale="ja" messages={{ search: "検索", map: "地図" }} />

      <main className="flex-1 p-6 max-w-xl mx-auto relative">
        {/* フローティングボタン */}
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

        {/* 投稿一覧 */}
        <h2 className="text-lg font-semibold mt-8">投稿一覧</h2>
        <ul className="mt-2 space-y-4 mb-16"> {/* ← 下に余白追加 */}
          {posts.map((post) => (
            <li
              key={post.id}
              className="bg-white border p-4 rounded shadow mx-auto w-full max-w-md"
            >
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