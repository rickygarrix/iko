"use client";

import { usePathname, useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale: currentLocale } = useParams() as { locale: string };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/") || "/";
    router.push(newPath);
  };

  return (
    <select
      onChange={handleChange}
      value={currentLocale}
      className="w-full h-[32px] text-xs text-gray-800 border border-gray-300 rounded-md px-2 bg-white shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#4B5C9E]"
    >
      <option value="ja">日本語</option>
      <option value="en">EN</option>
      <option value="zh">中文</option>
      <option value="ko">한국어</option>
    </select>
  );
}