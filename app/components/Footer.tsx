"use client";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white py-8">
      <div className="max-w-md mx-auto text-center space-y-4">

        {/* ロゴ（画像版） */}
        <Link href="/" passHref>
          <div className="flex justify-center items-center w-full mb-4">
            <div className="relative w-[61px] h-[20px]">
              <Image
                src="/footer/logo.svg"
                alt="オトナビ ロゴ"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </Link>

        {/* ナビゲーションリンク（2行・各行中央揃え） */}
        <div className="flex flex-col items-center space-y-2 text-sm">
          {/* 1行目：条件検索 / 地図検索 */}
          <div className="flex justify-center gap-10">
            <Link href="/search">
              <p className="hover:text-blue-400 transition cursor-pointer">条件検索</p>
            </Link>
            <Link href="/map">
              <p className="hover:text-blue-400 transition cursor-pointer">地図検索</p>
            </Link>
          </div>

          {/* 2行目：利用規約 / プライバシーポリシー */}
          <div className="flex justify-center gap-10">
            <Link href="/terms">
              <p className="hover:text-blue-400 transition cursor-pointer">利用規約</p>
            </Link>
            <Link href="/privacy">
              <p className="hover:text-blue-400 transition cursor-pointer">プライバシーポリシー</p>
            </Link>
          </div>
        </div>

        {/* コピーライト */}
        <p className="text-xs text-gray-400">&copy; オトナビ</p>
      </div>
    </footer>
  );
}