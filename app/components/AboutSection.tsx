// components/AboutSection.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Overlay from "@/components/Overlay";           // ← 既存のオーバーレイ
import { motion } from "framer-motion";

export default function AboutSection() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [showOverlay, setShowOverlay] = useState(false);

  /** 検索ボタン押下時の処理 */
  const handleSearch = () => {
    // ① オーバーレイ表示
    setShowOverlay(true);

    // ② 少し待ってから遷移
    setTimeout(() => {
      router.push(`/${locale}/search`);
      // ページが切り替わった後にオーバーレイを消す
      setTimeout(() => setShowOverlay(false), 800);
    }, 200);       // “ワンテンポ” 0.2 秒
  };

  return (
    <>
      {showOverlay && <Overlay />}

      <section className="w-full bg-[#4B5C9E] text-white flex justify-center">
        <div className="w-full max-w-[1400px] px-4 py-10 flex flex-col items-center gap-3">

          {/* ロゴ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative w-32 h-10"
          >
            <Image
              src="/footer/logo.svg"
              alt={t("about.logo_alt")}
              fill
              className="object-contain"
              priority
            />
          </motion.div>

          {/* 見出し・説明 */}
          <p className="text-sm font-semibold leading-tight tracking-wider">
            {t("about.subtitle")}
          </p>

          <p className="w-full py-4 max-w-[600px] text-sm font-light leading-relaxed text-center">
            {t("about.description")}
          </p>

          {/* 検索ボタン（Link ではなく button に変更） */}
          <button
            onClick={handleSearch}
            className="w-full max-w-[600px] h-12 px-4 bg-zinc-900 rounded-lg border border-zinc-900
                       flex items-center justify-center cursor-pointer
                        transition-transform duration-200
                       text-white text-sm font-medium"
          >
            {t("about.button")}
          </button>
        </div>
      </section>
    </>
  );
}