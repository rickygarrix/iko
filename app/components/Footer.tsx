"use client";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-[#1F1F21] border-t border-b border-gray-800 flex justify-center">
      {/* 中央寄せ・最大幅制限コンテナ */}
      <div className="w-full max-w-[1400px] px-4 py-8 flex flex-col justify-start items-center gap-4">
        {/* ロゴ */}
        <Link href="/" passHref>
          <div className="w-16 h-5 relative">
            <Image
              src="/footer/logo.svg"
              alt="オトナビ ロゴ"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>


        <div className="w-full flex justify-center items-start">
          <Link href="/search" className="px-4 py-2">
            <div className="text-white text-sm font-light font-['Hiragino_Kaku_Gothic_ProN'] leading-tight">
              条件検索
            </div>
          </Link>

          <div className="px-4 py-2">
            <div className="text-white text-sm font-light font-['Hiragino_Kaku_Gothic_ProN'] leading-tight">
              地図検索（開発中）
            </div>
          </div>
        </div>

        {/* 利用規約・プライバシーポリシー */}
        <div className="w-full flex justify-center items-start">
          <Link href="/terms" className="px-4 py-2">
            <div className="text-white text-xs font-light font-['Hiragino_Kaku_Gothic_ProN'] leading-none">
              利用規約
            </div>
          </Link>

          <Link href="/privacy" className="px-4 py-2">
            <div className="text-white text-xs font-light font-['Hiragino_Kaku_Gothic_ProN'] leading-none">
              プライバシーポリシー
            </div>
          </Link>
        </div>

        {/* コピーライト */}
        <div className="text-white text-xs font-light font-['Hiragino_Kaku_Gothic_ProN'] leading-none">
          ©︎ オトナビ
        </div>
      </div>
    </footer>
  );
}