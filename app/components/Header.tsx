"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";
import type { Messages } from "@/types/messages";
import type { Locale } from "@/i18n/config";
import Overlay from "@/components/Overlay";

type Props = {
  locale?: Locale;
  messages: Messages["header"];
};

export default function Header({ locale, messages }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [showOverlay, setShowOverlay] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null | undefined>(undefined); // ← 初期undefinedでチラ見え防止
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const extractedLocale =
    pathname?.startsWith("/ja") ? "ja" :
      pathname?.startsWith("/en") ? "en" :
        pathname?.startsWith("/zh") ? "zh" :
          pathname?.startsWith("/ko") ? "ko" :
            pathname === "/map" ? "ja" : "ja";

  const effectiveLocale = locale || extractedLocale;

  // Supabaseユーザー情報取得
  useEffect(() => {
    const fetchUserAvatar = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setUserId(null);
        setAvatarUrl(null);
        return;
      }

      const { data: supaUser } = await supabase.auth.getUser();
      const id = supaUser?.user?.id;
      if (!id) {
        setUserId(null);
        return;
      }

      setUserId(id);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("avatar_url")
        .eq("id", id)
        .single();

      if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      } else {
        const fallback = supaUser?.user?.user_metadata?.avatar_url ?? session?.user?.image ?? null;
        setAvatarUrl(fallback);
      }
    };

    fetchUserAvatar();
  }, [session]);

  // 外クリックでドロップダウン閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleHomeClick = useCallback(() => {
    const targetPath = effectiveLocale === "ja" ? "/ja" : `/${effectiveLocale}`;
    if (pathname !== targetPath) {
      document.body.style.opacity = "0";
      setTimeout(() => {
        router.push(targetPath);
        document.body.style.opacity = "1";
      }, 0);
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
        setShowOverlay(false);
      }, 100);
    }
  }, [pathname, router, effectiveLocale]);

  const handleMapClick = useCallback(async () => {
    if (effectiveLocale !== "ja") return;

    sessionStorage.removeItem("mapCenter");
    sessionStorage.removeItem("mapZoom");
    sessionStorage.removeItem("activeStoreId");
    sessionStorage.removeItem("cardScrollLeft");

    const targetPath = "/map";
    if (pathname === targetPath) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowOverlay(true);
      await router.push(targetPath);
      setShowOverlay(false);
    }
  }, [pathname, router, effectiveLocale]);

  return (
    <>
      {showOverlay && <Overlay />}
      <header className="fixed top-0 left-0 h-[48px] z-[1000] w-full bg-white shadow-[0_0_4px_0_rgba(0,0,0,0.1)] flex justify-center">
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

          <div className="flex items-center gap-3 min-w-[180px] justify-end">
            {/* 投稿 */}
            <Link href="/posts" className="w-12 h-12 flex flex-col items-center justify-center">
              <div className="w-6 h-6 relative">
                <Image src="/header/post.svg" alt="投稿" fill className="object-contain" />
              </div>
              <span className="text-[10px] text-zinc-900">投稿</span>
            </Link>

            {/* 検索 */}
            <button onClick={handleSearchClick} className="w-12 h-12 flex flex-col items-center justify-center">
              <div className="w-6 h-6 relative">
                <Image src="/header/search.svg" alt={messages.search} fill className="object-contain" />
              </div>
              <span className="text-[10px] text-zinc-900">{messages.search}</span>
            </button>

            {/* 地図 */}
            <div
              onClick={handleMapClick}
              className={`w-12 h-12 flex flex-col items-center justify-center ${effectiveLocale === "ja"
                  ? "hover:scale-105 active:scale-95 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
                }`}
            >
              <div className="w-6 h-6 relative">
                <Image src="/header/pin.svg" alt={messages.map} fill className="object-contain" />
              </div>
              <span className="text-[10px] text-zinc-900">{messages.map}</span>
            </div>

            {/* ログイン状態表示 */}
            <div className="w-8 relative">
              {userId === undefined ? null : userId ? (
                <div ref={dropdownRef} className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <img
                      src={avatarUrl ?? "/default.png"}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-50 w-32">
                      <Link
                        href="/mypage"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        マイページ
                      </Link>
                      <Link
                        href="/logout"
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        ログアウト
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="text-sm text-blue-600 hover:underline">
                  ログイン
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}