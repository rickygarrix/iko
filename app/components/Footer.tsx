"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Messages } from "@/types/messages";

type Props = {
  locale: "ja" | "en" | "zh" | "ko";
  messages: Messages["footer"];
};

export default function Footer({ messages }: Props) {
  const { locale } = useParams() as { locale?: string };

  return (
    <footer className="w-full bg-[#1F1F21] border-t border-b border-gray-800 flex justify-center">
      <div className="w-full max-w-[1400px] px-4 py-8 flex flex-col justify-start items-center gap-4">

        {/* ロゴ */}
        <Link href={`/${locale}/home`} passHref>
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

        {/* ナビリンク */}
        <div className="w-full flex justify-center items-start flex-wrap gap-2">
          <Link href={`/${locale}/search`} className="px-4 py-2">
            <div className="text-white text-sm font-light leading-tight">
              {messages.search}
            </div>
          </Link>
          <div className="px-4 py-2 text-white text-sm font-light leading-tight">
            {messages.map}
          </div>
          <Link href={`/${locale}/contact`} className="px-4 py-2">
            <div className="text-white text-sm font-light leading-tight">
              {messages.contact}
            </div>
          </Link>
        </div>

        {/* 利用規約・プライバシーポリシー */}
        <div className="w-full flex justify-center items-start flex-wrap gap-2">
          <Link href={`/${locale}/terms`} className="px-4 py-2">
            <div className="text-white text-xs font-light leading-none">
              {messages.terms}
            </div>
          </Link>
          <Link href={`/${locale}/privacy`} className="px-4 py-2">
            <div className="text-white text-xs font-light leading-none">
              {messages.privacy}
            </div>
          </Link>
        </div>

        {/* コピーライト */}
        <div className="text-white text-xs font-light leading-none">
          {messages.copyright}
        </div>
      </div>
    </footer>
  );
}