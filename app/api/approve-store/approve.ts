"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function approveStore(id: string) {
  // ① pending_storesからデータ取得
  const { data: pendingStore, error: fetchError } = await supabase
    .from("pending_stores")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !pendingStore) {
    console.error("承認エラー：pending_stores取得失敗", fetchError);
    throw new Error("承認に失敗しました（取得エラー）");
  }

  // ② stores用にマッピング
  const storeData = {
    id: pendingStore.id, // UUID引き継ぎ
    name: pendingStore.name,
    phone_number: pendingStore.phone,
    address: pendingStore.address,
    website: pendingStore.website_url,
    instagram: pendingStore.instagram_url,
    genre: pendingStore.genre,
    description: pendingStore.description,
    opening_hours: pendingStore.opening_hours,
    regular_holiday: pendingStore.regular_holiday,
    payment_methods: pendingStore.payment_methods,
    image_url: pendingStore.image_url,

    // ✅ ここ追加！
    is_published: false,

    // ↓ pendingには無いのでnull埋め
    alcohol: null,
    entry_fee: null,
    latitude: null,
    longitude: null,
    access: null,
    reservation: null,
    area: null,
    store_instagrams: null,
    store_instagrams2: null,
    store_instagrams3: null,
    map_link: null,
    map_embed: null,
    name_read: null,
  };

  // ③ storesテーブルに登録
  const { error: insertError } = await supabase
    .from("stores")
    .insert([storeData]);

  if (insertError) {
    console.error("登録失敗:", insertError.details, insertError.message);
    throw new Error(`承認に失敗しました（登録エラー: ${insertError.message}）`);
  }

  // ④ pending_storesから削除
  const { error: deleteError } = await supabase
    .from("pending_stores")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("承認エラー：pending_stores削除失敗", deleteError);
    throw new Error("承認に失敗しました（削除エラー）");
  }

  // ⑤ ページキャッシュをリセット
  revalidatePath("/admin/pending-stores");

  console.log("承認成功：id =", id);
}