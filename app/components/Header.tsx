"use client";

import Link from "next/link";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

export default function Header() {
  return (
    <header className="bg-white text-black p-4 shadow-md">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* 🔹 ロゴ */}
        <Link href="/" passHref>
          <h1 className="text-2xl font-bold cursor-pointer">オトナビ</h1>
        </Link>

        {/* 🔹 アイコンナビゲーション */}
        <div className="flex space-x-6">
          <Link href="/search" passHref className="flex flex-col items-center text-sm">
            <FaSearch className="text-xl cursor-pointer" />
            <span>条件</span>
          </Link>

          <Link href="/map" passHref className="flex flex-col items-center text-sm">
            <FaMapMarkerAlt className="text-xl cursor-pointer" />
            <span>地図</span>
          </Link>
        </div>
      </div>
    </header>
  );
}