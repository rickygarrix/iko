// app/not-found.tsx
"use client";

import Link from "next/link"; // ← これ追加！

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#F7F5EF] text-gray-800">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg mb-8">ページが見つかりませんでした。</p>
      <Link href="/" className="text-blue-600 underline">
        ホームに戻る
      </Link>
    </div>
  );
}