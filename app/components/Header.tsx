"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="flex items-center space-x-6">
        {/* 🔹 ロゴ */}
        <Link href="/" passHref>
          <h1 className="text-xl font-bold cursor-pointer hover:text-blue-400 transition">オトナビ</h1>
        </Link>

        {/* 🔹 オトナビとは？ */}
        <Link href="/about" passHref>
          <p className="cursor-pointer hover:text-blue-400 transition">オトナビとは？</p>
        </Link>

        {/* 🔹 検索画面へのリンク */}
        <Link href="/search" passHref>
          <p className="cursor-pointer hover:text-blue-400 transition">検索画面</p>
        </Link>

        {/* 🔹 地図から探すへのリンク */}
        <Link href="/map" passHref>
          <p className="cursor-pointer hover:text-blue-400 transition">地図から探す</p>
        </Link>
      </div>
    </header>
  );
}