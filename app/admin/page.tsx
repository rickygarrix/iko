"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email !== "chloerickyc@gmail.com") {
        router.replace("/not-found"); // ← ここで404風ページにリダイレクト
        return;
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return null; // ← 何も表示しない
  }

  return (
    <div className="min-h-screen bg-[#FEFCF6] pt-24 px-6 pb-10 text-gray-800">
      <h1 className="text-2xl font-bold mb-10 text-center">管理画面トップ</h1>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <AdminCard
          href="/admin/stores"
          title="公開中の店舗一覧"
          description="公開済みの店舗を管理します"
        />
        <AdminCard
          href="/admin/stores-to-publish"
          title="未公開の店舗一覧"
          description="これから公開する店舗を確認します"
        />
        <AdminCard
          href="/admin/pending-stores"
          title="申請中の店舗一覧"
          description="新規申請された店舗を審査します"
        />
        <AdminCard
          href="/admin/deleted-stores"
          title="削除済みの店舗一覧"
          description="過去に削除した店舗の履歴を確認します"
        />
      </div>
    </div>
  );
}

function AdminCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="block">
      <div className="p-6 bg-white rounded-xl border border-gray-200 shadow hover:shadow-lg hover:scale-[1.02] transition-all space-y-2 cursor-pointer">
        <p className="text-lg font-bold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}