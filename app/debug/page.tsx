"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function DebugPage() {
  useEffect(() => {
    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log("ログイン中のユーザー情報:", user);
      console.log("エラー情報:", error);
    })();
  }, []);

  return <div>デバッグ中...</div>;
}