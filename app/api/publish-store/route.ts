import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "IDがありません" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from("stores")
      .update({ is_published: true })
      .eq("id", id);

    if (error) {
      console.error("公開エラー:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("公開失敗:", err);
    return NextResponse.json({ error: "公開に失敗しました" }, { status: 500 });
  }
}