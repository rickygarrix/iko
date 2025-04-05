"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session Error:", error.message);
      }

      if (data.session) {
        router.replace("/"); // ログイン成功 → ホームへ
      }
    };

    checkSession();
  }, [router]); // 👈 ここを [router] に変更！！

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>ログイン中です...</p>
    </div>
  );
}