export const generateStaticParams = async () => {
  return ["ja", "en", "zh", "ko"].map((locale) => ({
    locale,
  }));
};

type Props = {
  params: { locale: "ja" | "en" | "zh" | "ko" };
};

export default function TermsPage({ params }: Props) {
  return (
    <div className="min-h-screen bg-white text-gray-800 p-6 pt-16">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 p-8 rounded-md shadow-md">
        <h1 className="text-3xl font-bold mb-6">利用規約</h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">第1条（適用）</h2>
          <p className="leading-relaxed">
            本利用規約（以下「本規約」）は、「オトナビ」（以下「本サービス」）の利用条件を定めるものです。
            本サービスを利用するすべての方（以下「ユーザー」）に適用されます。
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">第2条（サービスの内容）</h2>
          <p className="leading-relaxed">
            本サービスは、ナイトクラブ、ジャズバー、ライブハウスなどの情報を提供し、
            ユーザーが店舗を検索・閲覧・評価することを目的とした情報プラットフォームです。
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">第3条（禁止事項）</h2>
          <p className="leading-relaxed mb-2">
            ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>法令または公序良俗に違反する行為</li>
            <li>虚偽または誤解を招く情報の投稿</li>
            <li>誹謗中傷、脅迫、差別的発言など、他のユーザーや店舗への迷惑行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>無断での広告・宣伝行為</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">第4条（免責事項）</h2>
          <p className="leading-relaxed">
            本サービスは、提供する情報の正確性・完全性について保証するものではありません。
            ユーザーは自己の責任において情報を利用し、
            本サービスの利用により生じた損害について、当社は一切の責任を負いません。
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">第5条（サービスの変更・停止）</h2>
          <p className="leading-relaxed">
            当社は、ユーザーに事前通知することなく、本サービスの内容を変更・停止・終了することができます。
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">第6条（規約の変更）</h2>
          <p className="leading-relaxed">
            当社は、必要に応じて本規約を変更することができます。
            変更後の規約は、本サービス上に掲載された時点で効力を生じるものとします。
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">第7条（準拠法および裁判管轄）</h2>
          <p className="leading-relaxed">
            本規約の解釈および適用は、日本法に準拠するものとし、
            本サービスに関する紛争が生じた場合、当社の所在地を管轄する裁判所を第一審の専属管轄裁判所とします。
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-8">最終更新日: 2025年3月8日</p>
      </div>
    </div>
  );
}