// app/withdrawal/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WithdrawalPage() {
  const router = useRouter();

  const handleWithdraw = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      alert("ログイン情報が見つかりません。");
      return;
    }

    const ok = confirm("本当に退会しますか？投稿を含めすべて削除されます。この操作は取り消せません。");
    if (!ok) return;

    // ✅ 投稿を削除
    const { error: deletePostsError } = await supabase.from("posts").delete().eq("user_id", userId);
    if (deletePostsError) {
      alert("投稿の削除に失敗しました");
      console.error(deletePostsError);
      return;
    }

    // ✅ プロフィールを削除
    const { error: deleteProfileError } = await supabase.from("user_profiles").delete().eq("id", userId);
    if (deleteProfileError) {
      alert("退会に失敗しました");
      console.error(deleteProfileError);
      return;
    }

    // ✅ サインアウト
    await supabase.auth.signOut();

    alert("退会が完了しました。ご利用ありがとうございました。");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header locale="ja" messages={{ search: "検索", map: "地図" }} />

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded shadow-lg max-w-md w-full text-center space-y-6">
          <h1 className="text-xl font-bold">退会手続き</h1>
          <p>アカウントを削除すると、プロフィール情報が失われます。</p>
          <button
            onClick={handleWithdraw}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            退会する
          </button>
          <p
            className="text-sm text-gray-500 underline cursor-pointer mt-4"
            onClick={() => router.back()}
          >
            戻る
          </p>
        </div>
      </main>

      <Footer
        locale="ja"
        messages={{
          search: "検索",
          map: "地図",
          contact: "お問い合わせ",
          terms: "利用規約",
          privacy: "プライバシー",
          copyright: "© 2025 Otonavi",
        }}
      />
    </div>
  );
}