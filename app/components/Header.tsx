"use client";

import { usePathname, useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useCallback } from "react";
import Image from "next/image";
import type { Messages } from "@/types/messages";

type Props = {
  locale: "ja" | "en" | "zh" | "ko";
  messages: Messages["header"];
};

export default function Header({ locale, messages }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleHomeClick = useCallback(() => {
    const targetPath = `/${locale}`;
    if (pathname !== targetPath) {
      document.body.style.opacity = "0";
      router.push(targetPath);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 50);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
        document.body.style.opacity = "1";
      }, 200);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname, router, locale]);

  const handleSearchClick = useCallback(() => {
    const targetPath = `/${locale}/search`;
    if (pathname === targetPath) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.body.style.opacity = "0";
      router.push(targetPath);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 50);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
        document.body.style.opacity = "1";
      }, 200);
    }
  }, [pathname, router, locale]);

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)] flex justify-center">
      <div className="w-full max-w-[600px] px-4 h-[48px] flex justify-between items-center">
        {/* ロゴ */}
        <div
          onClick={handleHomeClick}
          className="w-20 h-6 relative cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <Image
            src="/header/logo.svg"
            alt="Logo"
            width={80}
            height={24}
            priority
          />
        </div>

        {/* 言語切り替え＋ナビゲーション */}
        <div className="flex items-center gap-2">
          <div className="w-[80px]">
            <LanguageSwitcher locale={locale} />
          </div>

          <button
            onClick={handleSearchClick}
            className="w-12 h-12 inline-flex flex-col justify-center items-center gap-1 transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <div className="w-6 h-6 relative">
              <Image
                src="/header/search.svg"
                alt={messages.search}
                fill
                className="object-contain"
              />
            </div>
            <span className="text-zinc-900 text-[10px] font-light leading-none">
              {messages.search}
            </span>
          </button>

          <div className="w-12 h-12 inline-flex flex-col justify-center items-center gap-1 opacity-50 cursor-not-allowed">
            <div className="w-6 h-6 relative">
              <Image
                src="/header/pin.svg"
                alt={messages.map}
                fill
                className="object-contain"
              />
            </div>
            <span className="text-zinc-900 text-[10px] font-light leading-none">
              {messages.map}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}