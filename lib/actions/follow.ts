// lib/actions/follow.ts
import { supabase } from "@/lib/supabase";

export const followUser = async (followerId: string, followingId: string) => {
  const { error } = await supabase
    .from("user_follows")
    .insert({ follower_id: followerId, following_id: followingId });

  return error;
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  const { error } = await supabase
    .from("user_follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  return error;
};

export const isFollowing = async (followerId: string, followingId: string) => {
  const { data, error } = await supabase
    .from("user_follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle(); // ← ★ single() だと0件でエラーになるので maybeSingle()

  if (error) {
    console.error("フォロー確認エラー:", error.message);
    return false;
  }

  return !!data;
};