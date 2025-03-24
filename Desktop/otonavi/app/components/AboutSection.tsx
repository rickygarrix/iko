import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="w-full bg-[#4B5C9E] text-white py-10 px-6 shadow-md">
      {/* ロゴ */}
      <div className="flex justify-center mb-2">
        <div className="relative w-[121px] h-[40px]">
          <Image
            src="/footer/logo.svg"
            alt="オトナビ ロゴ"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* サブタイトル */}
      <p className="text-[10px] text-center text-white mb-6 font-medium leading-[150%]">
        What’s Otonavi?
      </p>

      {/* 本文（左揃え & max-width） */}
      <div className="text-left text-[14px] leading-[180%] text-white max-w-[310px] mx-auto">
        <p>
          「オトナビ」は、クラブ・ジャズバー・ライブハウス専門の音楽スポット検索サービスです。
        </p>
        <p>
          あなたの“今夜の音”を見つけるために、雰囲気・エリア・音楽ジャンルから検索可能。
        </p>
        <p>
          夜の街をもっと自由に楽しみたい人へ、好みや気分で選べる体験をナビゲートします。
        </p>
      </div>

      {/* ボタン */}
      <div className="mt-6 text-center">
        <a
          href="/search"
          className="inline-block bg-black text-white text-[14px] w-[310px] font-medium py-3 px-6 rounded-lg hover:bg-gray-700 transition"
        >
          行きたいお店を見つけよう →
        </a>
      </div>
    </section>
  );
}