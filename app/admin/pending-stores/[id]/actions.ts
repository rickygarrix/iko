"use server";

import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function approveStore(id: string) {
  // データ取得
  const { data, error: fetchError } = await supabase
    .from("pending_stores")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !data) {
    console.error("取得失敗:", fetchError);
    throw new Error("データ取得に失敗しました");
  }

  // storesに追加
  const { error: insertError } = await supabase.from("stores").insert([
    {
      name: data.name,
      genre: data.genre,
      address: data.address,
      phone: data.phone,
      opening_hours: data.opening_hours,
      regular_holiday: data.regular_holiday,
      website_url: data.website_url,
      instagram_url: data.instagram_url,
      payment_methods: data.payment_methods,
      description: data.description,
      image_url: data.image_url,
    },
  ]);

  if (insertError) {
    console.error("登録失敗:", insertError);
    throw new Error("登録に失敗しました");
  }

  // pending_storesから削除
  const { error: deleteError } = await supabase
    .from("pending_stores")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("削除失敗:", deleteError);
    throw new Error("削除に失敗しました");
  }

  // 成功したら一覧にリダイレクト
  redirect("/admin/pending-stores");
}