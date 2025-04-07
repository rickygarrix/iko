"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FEFCF6] px-6 text-center">
      <div className="text-[#4B5C9E] text-6xl font-extrabold mb-4">404</div>

      <h1 className="text-xl md:text-2xl font-bold text-[#1F1F21] mb-3">
        お探しのページが見つかりませんでした
      </h1>

      <p className="text-sm text-gray-600 mb-8">
        ページが存在しないか、移動された可能性があります。
      </p>

      {/* 👇 ここを <Link> にする！ */}
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-[#4B5C9E] text-white text-sm font-semibold rounded-lg hover:bg-[#3a4a8d] transition-colors"
      >
        ホームへ戻る
      </Link>
    </div>
  );
}