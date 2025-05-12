"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // ✅ Google（Supabase OAuth）
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`, // ← ここに戻るよう Supabaseで設定しておく
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
    }
  };

  // ✅ LINE（NextAuth）
  const handleLineLogin = () => {
    signIn("line", { callbackUrl: "/" }); // ← 成功したら明示的に / に飛ぶ
  };

  // ✅ Supabaseログイン後の判定（/auth/callback から戻ってきたとき）
  useEffect(() => {
    const check = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        // 明示的にログイン後の動作をここに書く
        router.push("/");
      }
    };

    check();
  }, [router]);

  // ✅ NextAuthのログイン判定
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-[#FEFCF6] flex flex-col items-center justify-center gap-4">
      <button
        onClick={handleGoogleLogin}
        className="bg-[#4285F4] hover:bg-[#357ae8] text-white px-6 py-3 rounded-lg font-semibold shadow"
      >
        Googleでログイン（Supabase）
      </button>
      <button
        onClick={handleLineLogin}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow"
      >
        LINEでログイン（NextAuth）
      </button>
    </div>
  );
}