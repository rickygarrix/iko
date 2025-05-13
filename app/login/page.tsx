"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) console.error("Login error:", error.message);
  };

  useEffect(() => {
    const isCallback = location.pathname === "/auth/callback";
    if (!isCallback) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push("/");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEFCF6]">
      <button
        onClick={handleGoogleLogin}
        className="bg-[#4285F4] hover:bg-[#357ae8] text-white px-6 py-3 rounded-lg font-semibold shadow"
      >
        Googleでログイン
      </button>
    </div>
  );
}