// app/withdrawal/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WithdrawalPage() {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [preservePosts, setPreservePosts] = useState(true);

  const handleWithdraw = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      alert("ログイン情報が見つかりません。");
      return;
    }

    const confirmed = confirm("本当に退会しますか？この操作は取り消せません。");
    if (!confirmed) return;

    // ✅ 投稿を非表示に（is_active = false）
    const { error: deactivatePostsError } = await supabase
      .from("posts")
      .update({ is_active: false })
      .eq("user_id", userId);
    if (deactivatePostsError) {
      alert("投稿の非表示に失敗しました。");
      console.error(deactivatePostsError);
      return;
    }

    // ✅ アンケート送信
    const { error: feedbackError } = await supabase.from("withdrawal_feedbacks").insert({
      user_id: userId,
      reason: reason === "その他" ? customReason : reason,
      preserve_posts: true, // ← 常に true にして残す方針
    });
    if (feedbackError) {
      alert("退会アンケートの送信に失敗しました。");
      console.error(feedbackError);
      return;
    }

    // ✅ いいね・保存・フォローの削除
    await supabase.from("post_likes").delete().eq("user_id", userId);
    await supabase.from("user_saved_posts").delete().eq("user_id", userId);
    await supabase.from("user_follows").delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`);

    // ✅ プロフィール削除（匿名化ではなく完全削除）
    const { error: deleteProfileError } = await supabase.from("user_profiles").delete().eq("id", userId);
    if (deleteProfileError) {
      alert("プロフィールの削除に失敗しました");
      console.error(deleteProfileError);
      return;
    }

    // ✅ Supabase Auth 削除（/api/delete-user）
    const res = await fetch("/api/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      alert("アカウントの削除に失敗しました");
      return;
    }

    // ✅ ログアウト & トップへ
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

          <div className="text-left space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold mb-1">退会理由を教えてください（任意）</p>
              <select
                className="w-full border border-gray-300 rounded px-2 py-1"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="使わなくなった">使わなくなった</option>
                <option value="情報が少なかった">情報が少なかった</option>
                <option value="操作が難しかった">操作が難しかった</option>
                <option value="その他">その他</option>
              </select>
              {reason === "その他" && (
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-2 py-1 mt-2"
                  placeholder="自由記述"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              )}
            </div>

            <div>
              <p className="font-semibold mb-1">投稿の扱いについて</p>
              <p className="text-sm text-gray-600">
                投稿は画面上から削除されますが、データベースには保持されます。
              </p>
            </div>
          </div>

          <button
            onClick={handleWithdraw}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded w-full"
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