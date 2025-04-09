// app/api/delete-pending-store/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "IDがありません" }, { status: 400 });
  }

  const { error } = await supabase
    .from("pending_stores")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("削除エラー:", error.message);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}