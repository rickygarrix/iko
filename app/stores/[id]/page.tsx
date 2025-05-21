"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Skeleton from "@/components/Skeleton";
import MapEmbed from "@/components/MapEmbed";
import InstagramSlider from "@/components/InstagramSlider";
import NewPostModal from "@/components/NewPostModal";
import type { User } from "@supabase/supabase-js";
import { sendGAEvent } from "@/lib/ga";
import type { Store, TagCategory } from "@/types/schema";
import { useRouter } from "next/navigation";
import type { Post } from "@/types/post";

export default function StoreDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [tagCategories, setTagCategories] = useState<TagCategory[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [storePosts, setStorePosts] = useState<Post[]>([]);

  const { data: store, error, isLoading } = useSWR<Store>(
    id ? ["store", id] : null,
    async ([, id]) => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) throw new Error(error?.message || "データ取得失敗");
      return data;
    },
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (!id) return;

    // 投稿取得
    supabase
      .from("posts")
      .select(`
    id,
    body,
    created_at,
    user_id,
    user_profiles(id, name, avatar_url),
    post_tag_values(value, tag_category:tag_categories(key, label, min_label, max_label))
  `)
      .eq("store_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("店舗投稿取得エラー:", error.message);
        } else if (data) {
          const formatted: Post[] = data.map((p: any) => ({
            id: p.id,
            body: p.body,
            created_at: p.created_at,
            user_id: p.user_id,
            user: p.user_profiles ? {
              id: p.user_profiles.id,
              name: p.user_profiles.name ?? undefined,
              avatar_url: p.user_profiles.avatar_url ?? undefined,
            } : undefined,
            post_tag_values: (p.post_tag_values ?? []).map((tag: any) => ({
              value: tag.value,
              tag_category: {
                key: tag.tag_category.key,
                label: tag.tag_category.label,
                min_label: tag.tag_category.min_label,
                max_label: tag.tag_category.max_label,
              }
            })),
          }));

          setStorePosts(formatted);
        }
      });
  }, [id]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user && id) {
        supabase
          .from("store_follows")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("store_id", id)
          .then(({ data }) => {
            if (data && data.length > 0) setIsFollowing(true);
          });
      }
    });
    supabase
      .from("tag_categories")
      .select("*")
      .then(({ data }) => {
        if (data) setTagCategories(data);
      });
  }, [id]);

  const handleFollowToggle = async () => {
    if (!user || !store) return;
    if (isFollowing) {
      await supabase
        .from("store_follows")
        .delete()
        .eq("user_id", user.id)
        .eq("store_id", store.id);
      setIsFollowing(false);
    } else {
      await supabase
        .from("store_follows")
        .upsert({ user_id: user.id, store_id: store.id });
      setIsFollowing(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FEFCF6] text-gray-800 pt-[48px] flex justify-center">
        <div className="w-full max-w-[600px] p-6 space-y-6">
          <Skeleton width="100%" height={24} />
          <Skeleton width="60%" height={16} />
          <Skeleton width="100%" height={80} />
          <Skeleton width="100%" height={200} />
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-[#FEFCF6] text-center pt-[100px] text-red-500">
        店舗が見つかりませんでした。
      </div>
    );
  }

  const genreLabels: Record<string, string> = {
    jazz: "ジャズ",
    house: "ハウス",
    techno: "テクノ",
    edm: "EDM",
    hiphop: "ヒップホップ",
    pop: "ポップス",
    rock: "ロック",
    reggae: "レゲエ",
    other: "その他",
  };

  return (
    <div className="min-h-screen bg-[#FEFCF6] text-gray-800 pt-[48px]">
      <div className="w-full max-w-[600px] mx-auto bg-[#FDFBF7] shadow-md rounded-lg overflow-hidden">
        {store.map_embed && (
          <div className="mb-4">
            <a
              href={store.map_link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                sendGAEvent("click_map", { store_id: store.id, store_name: store.name });
              }}
            >
              <MapEmbed src={store.map_embed} title={`${store.name}の地図`} />
            </a>
          </div>
        )}

        <div className="p-4">
          <h1 className="text-2xl font-bold mb-1">{store.name}</h1>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{store.description}</p>
        </div>

        {user && (
          <div className="flex justify-end gap-4 px-4 mb-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            >
              投稿する
            </button>
            <button
              className={`px-4 py-1 rounded text-white ${isFollowing ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                }`}
              onClick={handleFollowToggle}
            >
              {isFollowing ? "フォロー中" : "フォロー"}
            </button>
          </div>
        )}

        <div className="my-10 px-4">
          <p className="text-base mb-2 flex items-center gap-2 text-[#1F1F21]">
            <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded-[2px] inline-block" /> 店舗情報
          </p>
          <table className="w-full border border-[#E7E7EF] text-sm table-fixed text-black">
            <tbody>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal w-[90px]">店舗名</th>
                <td className="border px-4 py-4">{store.name}</td>
              </tr>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal">ジャンル</th>
                <td className="border px-4 py-4 whitespace-pre-wrap">
                  {store.genre_ids?.map((gid) => genreLabels[gid] || gid).join(" / ")}
                </td>
              </tr>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal">所在地</th>
                <td className="border px-4 py-4 whitespace-pre-wrap">{store.address}</td>
              </tr>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal">アクセス</th>
                <td className="border px-4 py-4 whitespace-pre-wrap">{store.access}</td>
              </tr>
              <tr>
                <th className="border bg-[#FDFBF7] px-4 py-4 text-left font-normal">営業時間</th>
                <td className="border px-4 py-4 whitespace-pre-wrap">
                  {store.opening_hours}
                  <p className="text-[10px] text-gray-500 mt-1">※日により変更する可能性があります。</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <InstagramSlider
          posts={[store.store_instagrams, store.store_instagrams2, store.store_instagrams3].filter(
            (url): url is string => Boolean(url)
          )}
        />

        {store.website && (
          <div className="px-4 pb-4">
            <a
              href={store.website}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-[358px] h-[48px] bg-black text-white rounded-lg hover:bg-gray-800 flex items-center justify-center mx-auto"
              onClick={() => {
                sendGAEvent("click_official_website", {
                  store_id: store.id,
                  store_name: store.name,
                  website_url: store.website,
                });
              }}
            >
              公式サイト →
            </a>
          </div>
        )}
      </div>

      {showModal && user && (
        <NewPostModal
          selectedStore={{ id: store.id, name: store.name }}
          tagCategories={tagCategories}
          user={user}
          onClose={() => setShowModal(false)}
          onPosted={() => setShowModal(false)}
        />
      )}

      {storePosts.length > 0 && (
        <div className="max-w-[600px] mx-auto mt-10 px-4">
          <h2 className="text-lg font-semibold mb-4">この店舗の投稿</h2>
          <ul className="space-y-4">
            {storePosts.map((post) => (
              <li key={post.id} className="bg-white border rounded shadow p-4">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={post.user?.avatar_url ?? "/default-avatar.svg"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <p className="text-sm font-semibold">{post.user?.name ?? "匿名"}</p>
                </div>
                <p className="text-gray-800 text-sm mb-2">{post.body}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  {post.post_tag_values?.map((tag) => (
                    <p key={tag.tag_category.key}>
                      {tag.tag_category.label}：{tag.value}（{tag.tag_category.min_label}〜{tag.tag_category.max_label}）
                    </p>
                  ))}
                </div>
                <small className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );


}
