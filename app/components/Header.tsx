"use client";

import { usePathname, useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Overlay from "@/components/Overlay";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Messages } from "@/types/messages";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Locale } from "@/i18n/config";

type Props = {
  locale?: Locale;
  messages: Messages["header"];
};

export default function Header({ locale, messages }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [showOverlay, setShowOverlay] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // /map 専用の補完処理：ロケールがURLに含まれていない場合は "ja" にフォールバック
  const extractedLocale =
    pathname.startsWith("/ja") ? "ja" :
      pathname.startsWith("/en") ? "en" :
        pathname.startsWith("/zh") ? "zh" :
          pathname.startsWith("/ko") ? "ko" :
            pathname === "/map" ? "ja" : "ja";

  const effectiveLocale = locale || extractedLocale;

  const isMapPage = pathname === "/map";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  const handleHomeClick = useCallback(() => {
    const targetPath = effectiveLocale === "ja" ? "/ja" : `/${effectiveLocale}`;
    if (pathname !== targetPath) {
      document.body.style.opacity = "0";
      router.push(targetPath);
      setTimeout(() => window.scrollTo({ top: 0 }), 50);
      setTimeout(() => {
        document.body.style.opacity = "1";
      }, 200);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname, router, effectiveLocale]);

  const handleSearchClick = useCallback(() => {
    const targetPath = `/${effectiveLocale}/search`;
    if (pathname === targetPath) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowOverlay(true);
      setTimeout(() => {
        router.push(targetPath);
        setTimeout(() => {
          setShowOverlay(false);
        }, 800);
      }, 100);
    }
  }, [pathname, router, effectiveLocale]);

  const handleMapClick = useCallback(() => {
    if (effectiveLocale !== "ja") return;

    const targetPath = "/map";
    if (pathname === targetPath) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowOverlay(true);
      setTimeout(() => {
        router.push(targetPath);
        setTimeout(() => {
          setShowOverlay(false);
        }, 800);
      }, 100);
    }
  }, [pathname, router, effectiveLocale]);

  return (
    <>
      {showOverlay && <Overlay />}

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

          <div className="flex items-center gap-2">

            {/* 投稿 */}
            <Link
              href="/posts"
              className="w-12 h-12 inline-flex flex-col justify-center items-center gap-1 transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <div className="w-6 h-6 relative">
                <Image
                  src="/header/post.svg" // アイコン画像は適宜 `/public/header/post.svg` に配置
                  alt="投稿"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-zinc-900 text-[10px] font-light leading-none">
                投稿
              </span>
            </Link>

            {/* 検索 */}
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

            {/* 地図 */}
            <div
              onClick={handleMapClick}
              className={`w-12 h-12 inline-flex flex-col justify-center items-center gap-1 transition-transform duration-200 ${effectiveLocale === "ja"
                ? "hover:scale-105 active:scale-95 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
                }`}
            >
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

            {/* ログイン / ログアウト */}
            {user ? (
              <div className="flex items-center gap-2">
                {user.user_metadata?.avatar_url && (
                  <Link href="/mypage">
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </Link>
                )}
                <Link
                  href="/logout"
                  className="text-sm text-blue-600 hover:underline"
                >
                  ログアウト
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:underline"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}