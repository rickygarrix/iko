// app/api/delete-store/route.ts

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, tableName } = await req.json();

  // 1. 元テーブルからデータ取得
  const { data: store, error: fetchError } = await supabase
    .from(tableName)
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !store) {
    console.error("データ取得エラー:", fetchError);
    return NextResponse.json({ success: false, message: "取得失敗" });
  }

  // 2. deleted_storesに保存
  const { error: insertError } = await supabase.from("deleted_stores").insert([
    {
      uuid: store.id,
      name: store.name,
      genre: store.genre,
      address: store.address,
      phone_number: store.phone_number,
      opening_hours: store.opening_hours,
      regular_holiday: store.regular_holiday,
      website: store.website,
      instagram: store.instagram,
      payment_methods: store.payment_methods,
      description: store.description,
      image_url: store.image_url,
      is_published: store.is_published ?? null,
      original_table: tableName,
    },
  ]);

  if (insertError) {
    console.error("deleted_stores挿入エラー:", insertError);
    return NextResponse.json({ success: false, message: "deleted_stores保存失敗" });
  }

  // 3. 元テーブルから削除
  const { error: deleteError } = await supabase
    .from(tableName)
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("元テーブル削除エラー:", deleteError);
    return NextResponse.json({ success: false, message: "削除失敗" });
  }

  return NextResponse.json({ success: true, message: "削除成功" });
}