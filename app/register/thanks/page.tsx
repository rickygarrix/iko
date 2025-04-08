"use client";

import { useRouter } from "next/navigation";

export default function StoreRegisterThanksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FEFCF6] flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold text-center mb-6">店舗情報のご登録ありがとうございます！</h1>
      <p className="text-center text-gray-600 mb-8">
        ご入力いただいた内容を確認後、掲載の可否をご連絡いたします。
      </p>
      <button
        onClick={() => router.push("/")}
        className="bg-[#1F1F21] text-white rounded px-6 py-3 hover:bg-[#333]"
      >
        ホームに戻る
      </button>
    </div>
  );
}