"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-8 flex flex-col md:flex-row md:justify-between items-center">
      {/* ✅ 左寄せ（オトナビ・オトナビとは？・利用規約・プライバシーポリシー） */}
      <div className="flex space-x-6 items-center md:items-start">
        <Link href="/" passHref>
          <h1 className="text-lg font-bold cursor-pointer hover:text-blue-400 transition">オトナビ</h1>
        </Link>
        <Link href="/about" passHref>
          <p className="text-sm cursor-pointer hover:text-blue-400 transition">オトナビとは？</p>
        </Link>
        <Link href="/terms" passHref>
          <p className="text-sm cursor-pointer hover:text-blue-400 transition">利用規約</p>
        </Link>
        <Link href="/privacy" passHref>
          <p className="text-sm cursor-pointer hover:text-blue-400 transition">プライバシーポリシー</p>
        </Link>
      </div>

      {/* ✅ 横中央寄せ（コピーライト） */}
      <div className="w-full md:w-auto text-center md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
        <p className="text-sm text-gray-400">
          &copy; オトナビ
        </p>
      </div>
    </footer>
  );
}