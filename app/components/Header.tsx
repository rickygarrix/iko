"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-[#FEFCF6] text-black h-[48px] shadow-md">
      <div className="flex items-center justify-between max-w-md mx-auto pl-4 pr-2 h-full">
        {/* ロゴ */}
        <Link href="/" passHref>
          <div className="relative w-[61px] h-[20px]">
            <Image
              src="header/logo.svg"
              alt="オトナビ ロゴ"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* アイコンナビゲーション */}
        <div className="flex">
          <Link href="/search" className="flex flex-col items-center w-[48px] h-[48px] justify-center">
            <Image src="/header/search.svg" alt="検索" width={24} height={24} />
            <span className="text-[8px]">条件</span>
          </Link>

          <Link href="/map" className="flex flex-col items-center w-[48px] h-[48px] justify-center">
            <Image src="/header/pin.svg" alt="地図" width={24} height={24} />
            <span className="text-[8px]">地図</span>
          </Link>
        </div>
      </div>
    </header>
  );
}