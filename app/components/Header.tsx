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

type Props = {
  locale: "ja" | "en" | "zh" | "ko";
  messages: Messages["header"];
};

export default function Header({ locale, messages }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [showOverlay, setShowOverlay] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
      else setUser(null);
    });
  }, []);

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
      setShowOverlay(true);

      setTimeout(() => {
        router.push(targetPath);
        setTimeout(() => {
          setShowOverlay(false);
        }, 800);
      }, 100);
    }
  }, [pathname, router, locale]);

  const handleMapClick = useCallback(() => {
    if (locale !== "ja") return;

    const targetPath = `/map`;
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
  }, [pathname, router, locale]);

  return (
    <>
      {showOverlay && <Overlay />}

      <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)] flex justify-center">
        <div className="w-full max-w-[600px] px-4 h-[48px] flex justify-between items-center">
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

            <div
              onClick={handleMapClick}
              className={`w-12 h-12 inline-flex flex-col justify-center items-center gap-1 transition-transform duration-200 ${locale === "ja"
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

            {/* ログイン状態による切り替え */}
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
