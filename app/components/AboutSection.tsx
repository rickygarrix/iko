export default function AboutSection() {
  return (
    <section className="bg-[#4B5C9E] text-white py-12 px-6 mt-12 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-1 text-center text-center">オトナビ</h2>
      <p className="text-sm text-gray-200 text-center mb-6">What’s Otonavi?</p>
      <p className="text-sm leading-relaxed">
        「オトナビ」は、クラブ・ジャズバー・ライブハウス専門の音楽スポット検索サービスです。<br />
        あなたの“今夜の音”を見つけるために、雰囲気・エリア・音楽ジャンルから検索可能。<br />
        夜の街をもっと自由に楽しみたい人へ、好みや気分で選べる体験をナビゲートします。
      </p>
      <div className="mt-4 text-center">
        <a
          href="/search"
          className="inline-block bg-black text-white font-semibold py-2 px-4 rounded hover:bg-gray-100 transition"
        >
          行きたいお店を見つけよう →
        </a>
      </div>
    </section>
  );
}