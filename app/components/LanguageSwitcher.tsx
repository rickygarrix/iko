"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
};

export default function LanguageSwitcher({ locale }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    setIsLoading(true); // ローディング開始

    const segments = pathname.split("/");
    if (segments.length > 1) {
      segments[1] = newLocale;
    }
    const newPath = segments.join("/") || `/${newLocale}`;

    setTimeout(() => {
      router.push(newPath);
    }, 150); // わずかにディレイしてチラ見え防止
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-white/70 pointer-events-none transition-opacity duration-300" />
      )}
      <select
        onChange={handleChange}
        value={locale}
        disabled={isLoading}
        className="w-full h-[32px] text-xs text-gray-800 border border-gray-300 rounded-md px-2 bg-white shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#4B5C9E] hover:bg-gray-100"
      >
        <option value="ja">日本語</option>
        <option value="en">EN</option>
        <option value="zh">中文</option>
        <option value="ko">한국어</option>
      </select>
    </>
  );
}