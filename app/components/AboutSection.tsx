"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "next/link"; // ✅ 追加！

export default function AboutSection() {
  const t = useTranslations();

  return (
    <section className="w-full bg-[#4B5C9E] text-white flex justify-center">
      <div className="w-full max-w-[1400px] px-4 py-10 flex flex-col items-center gap-3">
        <div className="relative w-32 h-10">
          <Image
            src="/footer/logo.svg"
            alt={t("about.logo_alt")}
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="text-sm font-semibold leading-tight tracking-wider">
          {t("about.subtitle")}
        </div>

        <div className="w-full py-4 max-w-[600px] text-sm font-light leading-relaxed text-center">
          {t("about.description")}
        </div>

        {/* ✅ 修正済み：<Link>を使用 */}
        <Link
          href="/search"
          className="w-full max-w-[600px] h-12 px-4 bg-zinc-900 rounded-lg border border-zinc-900
            flex items-center justify-center cursor-pointer
            hover:scale-105 active:scale-95 transition-transform duration-200 text-white text-sm font-medium"
        >
          {t("about.button")}
        </Link>
      </div>
    </section>
  );
}