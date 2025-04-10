"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation"; // ✅ ちゃんと使う！
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null); // null:チェック中

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("ログインが必要です");
        router.push("/login");
        return;
      }

      if (user.email !== "chloerickyc@gmail.com") {
        alert("アクセス権限がありません");
        router.push("/");
        return;
      }

      setAuthorized(true); // OK
    };

    checkAuth();
  }, [router]);

  if (authorized === null) {
    return <div className="text-center p-10 text-gray-800">認証確認中...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FEFCF6] p-10 text-gray-800">
      <h1 className="text-2xl font-bold mb-8 text-center">管理画面トップ</h1>

      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <AdminLink href="/admin/stores" label="公開中の店舗一覧" />
        <AdminLink href="/admin/stores-to-publish" label="未公開の店舗一覧" />
        <AdminLink href="/admin/pending-stores" label="申請中の店舗一覧" />
        <AdminLink href="/admin/deleted-stores" label="削除済みの店舗一覧" />
      </div>
    </div>
  );
}

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block p-6 bg-white rounded-lg shadow hover:bg-gray-100 transition"
    >
      <p className="text-lg font-semibold">{label}</p>
    </Link>
  );
}