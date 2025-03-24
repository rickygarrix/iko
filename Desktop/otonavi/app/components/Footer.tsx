"use client";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white py-2 pt-8">
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

        {/* ナビゲーションリンク（2カラム） */}
        <div className="flex flex-col items-center space-y-6 text-sm">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <Link href="/search">
              <p className="hover:text-blue-400 transition cursor-pointer text-center">条件検索</p>
            </Link>
            <Link href="/map">
              <p className="hover:text-blue-400 transition cursor-pointer text-center">地図検索</p>
            </Link>
            <Link href="/terms">
              <p className="hover:text-blue-400 transition cursor-pointer text-center">利用規約</p>
            </Link>
            <Link href="/privacy">
              <p className="hover:text-blue-400 transition cursor-pointer text-center">プライバシーポリシー</p>
            </Link>
          </div>
        </div>
      </div>

      {/* コピーライト */}
      <p className="text-xs text-center py-2 text-gray-400">&copy; オトナビ</p>

    </footer >
  );
}