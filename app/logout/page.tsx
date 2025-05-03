// app/logout/page.tsx
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut();
      router.push("/");
    };
    logout();
  }, [router]);

  return (
    <div className="text-center p-10 text-gray-800">
      ログアウト中...
    </div>
  );
}