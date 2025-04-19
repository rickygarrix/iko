"use client";

import { useRouter } from "next/navigation";

export default function ThanksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FEFCF6] flex flex-col items-center justify-center p-8">
      <div className="bg-white shadow-md rounded-lg p-10 max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          お問い合わせありがとうございました！
        </h1>
        <p className="text-gray-600 text-base mb-10">
          内容を確認のうえ、担当者よりご連絡させていただきます。
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-[#1F1F21] text-white rounded-full px-8 py-3 text-lg hover:bg-[#333] transition-all duration-200"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
}