"use client";

import { useContactStore } from "@/lib/store/contactStore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ContactConfirmPage() {
  const router = useRouter();
  const contact = useContactStore((state) => state.contact);
  const resetContact = useContactStore((state) => state.resetContact);
  const [error, setError] = useState("");

  const handleSend = async () => {
    const { error } = await supabase.from("contacts").insert([
      {
        category: contact.category,
        email: contact.email,
        name: contact.name,
        subject: contact.subject,
        message: contact.message,
      },
    ]);

    if (error) {
      console.error("送信エラー:", error);
      setError("送信に失敗しました。時間を置いて再度お試しください。");
    } else {
      console.log("送信成功");
      resetContact(); // 送信後にstoreをクリア
      router.push("/thanks");
    }
  };

  const handleBack = () => {
    router.back(); // 1つ前に戻る
  };

  return (
    <div className="min-h-screen bg-[#FEFCF6] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg p-8 text-gray-800">
        <h1 className="text-2xl font-bold text-center mb-6">内容確認</h1>

        <div className="space-y-4 mb-8">
          <div>
            <p className="text-sm text-gray-500">カテゴリ</p>
            <p className="text-lg">{contact.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">メールアドレス</p>
            <p className="text-lg">{contact.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">お名前</p>
            <p className="text-lg">{contact.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">件名</p>
            <p className="text-lg">{contact.subject || "(なし)"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">お問い合わせ内容詳細</p>
            <p className="text-lg whitespace-pre-wrap">{contact.message}</p>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="text-red-500 text-sm font-semibold mb-4 text-center">
            {error}
          </div>
        )}

        {/* ボタン */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleSend}
            className="w-full bg-[#1F1F21] text-white rounded p-3 hover:bg-[#333]"
          >
            送信する
          </button>
          <button
            onClick={handleBack}
            className="w-full border border-gray-400 text-gray-700 rounded p-3 hover:bg-gray-100"
          >
            修正する
          </button>
        </div>
      </div>
    </div>
  );
}