"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false); // ★ 認証チェック完了フラグ

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user && user.email === "chloerickyc@gmail.com") {
        setAuthorized(true);
      }
      setChecked(true); // ★ チェック完了
    };

    checkAuth();
  }, []);

  if (!checked) {
    return null;
  }

  if (!authorized) {
    notFound(); // ← ★ここ！管理者以外なら即404！
  }

  return <>{children}</>;
}