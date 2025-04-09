// app/api/approve-store/route.ts
import { NextResponse } from "next/server";
import { approveStore } from "./approve";


export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "IDがありません" }, { status: 400 });
  }

  try {
    await approveStore(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("APIエラー:", err);
    return NextResponse.json({ error: "承認失敗" }, { status: 500 });
  }
}