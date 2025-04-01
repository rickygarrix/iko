"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`, // ログイン後に戻るURLを指定
      },
    });

    if (error) console.error("Login error:", error.message);
  };

  useEffect(() => {
    // すでにログイン済みならホームにリダイレクト
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push("/");
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FEFCF6] flex items-center justify-center">
      <button
        onClick={handleLogin}
        className="bg-[#4285F4] hover:bg-[#357ae8] text-white px-6 py-3 rounded-lg font-semibold shadow"
      >
        Googleでログイン
      </button>
    </div>
  );
}