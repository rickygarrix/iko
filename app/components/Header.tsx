"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // ホーム遷移＋スクロールトップ＋チラ見え防止
  const handleHomeClick = useCallback(() => {
    if (pathname !== "/") {
      document.body.style.opacity = "0"; // チラ見え防止

      router.push("/");

      setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 50);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
        document.body.style.opacity = "1"; // 表示復元
      }, 200);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname, router]);

  // 検索ページ遷移＋スクロールトップ
  const handleSearchClick = useCallback(() => {
    if (pathname === "/search") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.body.style.opacity = "0"; // チラ見え防止

      router.push("/search");

      setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 50);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
        document.body.style.opacity = "1"; // 表示復元
      }, 200);
    }
  }, [pathname, router]);

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)] flex justify-center">
      <div className="w-full max-w-[600px] px-4 h-[48px] flex justify-between items-center">
        {/* オトナビロゴ */}
        <div
          onClick={handleHomeClick}
          className="w-20 h-6 relative cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <Image
            src="/header/logo.svg"
            alt="オトナビ ロゴ"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* ナビゲーション */}
        <div className="flex justify-start items-center">
          {/* 条件ボタン */}
          <button
            onClick={handleSearchClick}
            className="w-12 h-12 inline-flex flex-col justify-center items-center gap-1
             transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <div className="w-6 h-6 relative">
              <Image
                src="/header/search.svg"
                alt="検索"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-zinc-900 text-[10px] font-light leading-none">
              条件
            </span>
          </button>

          {/* 地図ボタン（開発中） */}
          <div className="w-12 h-12 inline-flex flex-col justify-center items-center gap-1 opacity-50 cursor-not-allowed">
            <div className="w-6 h-6 relative">
              <Image
                src="/header/pin.svg"
                alt="地図"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-zinc-900 text-[10px] font-light leading-none">
              開発中
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}