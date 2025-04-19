"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config"; // ★ 型があるなら使う！

type Props = {
  locale: Locale;
};

export default function LanguageSwitcher({ locale }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;

    const segments = pathname.split("/");
    if (segments.length > 1) {
      segments[1] = newLocale;
    }
    const newPath = segments.join("/") || `/${newLocale}`;
    router.push(newPath);
  };

  return (
    <select
      onChange={handleChange}
      value={locale}
      className="w-full h-[32px] text-xs text-gray-800 border border-gray-300 rounded-md px-2 bg-white shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#4B5C9E]"
    >
      <option value="ja">日本語</option>
      <option value="en">EN</option>
      <option value="zh">中文</option>
      <option value="ko">한국어</option>
    </select>
  );
}