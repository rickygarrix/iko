"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSearchClick = () => {
    if (pathname === "/search") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/search");
    }
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)] flex justify-center">
      {/* 中央寄せコンテナ */}
      <div className="w-full max-w-[600px] px-4 h-[48px] flex justify-between items-center">
        {/* ロゴエリア */}
        <Link href="/" passHref>
          <div className="w-20 h-6 relative">
            <Image
              src="/header/logo.svg"
              alt="オトナビ ロゴ"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* ナビゲーションエリア */}
        <div className="flex justify-start items-center">
          {/* 条件ボタン（動的に動作） */}
          <button
            onClick={handleSearchClick}
            className="w-12 h-12 inline-flex flex-col justify-center items-center gap-1"
          >
            <div className="w-6 h-6 relative ">
              <Image src="/header/search.svg" alt="検索" fill className="object-contain" />
            </div>
            <span className="text-zinc-900 text-[10px] font-light font-['Hiragino_Kaku_Gothic_ProN'] leading-none">
              条件
            </span>
          </button>

          {/* 地図ボタン（通常遷移） */}
          <Link href="/map" className="w-12 h-12 inline-flex flex-col justify-center items-center gap-1">
            <div className="w-6 h-6 relative">
              <Image src="/header/pin.svg" alt="地図" fill className="object-contain" />
            </div>
            <span className="text-zinc-900 text-[10px] font-light font-['Hiragino_Kaku_Gothic_ProN'] leading-none">
              地図
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}