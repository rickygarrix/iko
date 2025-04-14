import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="w-full bg-[#4B5C9E] text-white flex justify-center">
      {/* 中央寄せ・幅制限コンテナ */}
      <div className="w-full max-w-[1400px] px-4 py-10 flex flex-col items-center gap-3">
        {/* ロゴ */}
        <div className="relative w-32 h-10">
          <Image
            src="/footer/logo.svg"
            alt="オトナビ ロゴ"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* サブタイトル */}
        <div className="text-sm font-semibold leading-tight tracking-wider">
          What’s Otonavi?
        </div>

        {/* 説明文 */}
        <div className="w-full py-4 max-w-[600px] text-sm font-light leading-relaxed text-center">
          夜に音楽を楽しむことをもっと気軽に。オトナビは夜の音楽スポットを初心者の方でも安心して使えるよう、これからも進化していきます
        </div>

        {/* ボタン */}
        <div
          className="w-full max-w-[600px] h-12 px-4 bg-zinc-900 rounded-lg border border-zinc-900
  flex items-center justify-center cursor-pointer
  hover:scale-105 active:scale-95 transition-transform duration-200"
        >
          <a href="/search" className="text-white text-sm font-medium">
            行きたいお店を見つけよう →
          </a>
        </div>
      </div>
    </section>
  );
}