"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-8 text-center">
      {/* サイト名 */}
      <h1 className="text-xl font-bold mb-4">オトナビ</h1>

      {/* リンク一覧 */}
      <div className="flex justify-center gap-8 mb-4 flex-wrap text-sm">
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
    </footer>
  );
}
