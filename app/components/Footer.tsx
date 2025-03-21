"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white py-8">
      <div className="max-w-md mx-auto text-center space-y-4">

        {/* ロゴ */}
        <Link href="/" passHref>
          <h1 className="text-xl font-bold cursor-pointer">オトナビ</h1>
        </Link>

        {/* ナビゲーションリンク */}
        <div className="flex justify-center gap-6 flex-wrap text-sm">
          <Link href="/search">
            <p className="hover:text-blue-400 transition cursor-pointer">条件検索</p>
          </Link>
          <Link href="/map">
            <p className="hover:text-blue-400 transition cursor-pointer">地図検索</p>
          </Link>
          <Link href="/privacy">
            <p className="hover:text-blue-400 transition cursor-pointer">プライバシーポリシー</p>
          </Link>
          <Link href="/terms">
            <p className="hover:text-blue-400 transition cursor-pointer">利用規約</p>
          </Link>
        </div>

        {/* コピーライト */}
        <p className="text-xs text-gray-400">&copy; オトナビ</p>
      </div>
    </footer>
  );
}