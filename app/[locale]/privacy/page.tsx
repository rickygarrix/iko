export const generateStaticParams = async () => {
  return ["ja", "en", "zh", "ko"].map((locale) => ({
    locale,
  }));
};


export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 p-6 pt-16">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 p-8 rounded-md shadow-md">
        <h1 className="text-2xl font-bold mb-6">プライバシーポリシー</h1>

        <p className="mb-6 leading-relaxed">
          本プライバシーポリシーは、オトナビ（以下、「当サイト」）が提供するサービスにおいて、
          ユーザーの個人情報の取り扱いについて定めるものです。
        </p>

        <h2 className="text-xl font-semibold mb-2">1. 収集する情報</h2>
        <p className="mb-2">当サイトは、以下の種類の情報を収集することがあります。</p>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          <li>ユーザーが提供する情報（名前、メールアドレス、プロフィール情報など）</li>
          <li>アクセス情報（IPアドレス、ブラウザ情報、閲覧履歴など）</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">2. 情報の利用目的</h2>
        <p className="mb-2">収集した情報は、以下の目的で利用します。</p>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          <li>サービスの提供・運営</li>
          <li>お問い合わせ対応</li>
          <li>利用状況の分析によるサービス改善</li>
          <li>不正行為の防止</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">3. 情報の第三者提供</h2>
        <p className="mb-2">当サイトは、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません。</p>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          <li>ユーザーの同意がある場合</li>
          <li>法律に基づく開示要請があった場合</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">4. クッキー（Cookie）の利用</h2>
        <p className="mb-6 leading-relaxed">
          当サイトでは、利用状況を把握するためにクッキーを使用することがあります。
          クッキーはブラウザの設定で拒否することができますが、その場合、一部の機能が利用できなくなる可能性があります。
        </p>

        <h2 className="text-xl font-semibold mb-2">5. プライバシーポリシーの変更</h2>
        <p className="mb-6 leading-relaxed">
          本プライバシーポリシーは、予告なく変更されることがあります。
          変更後は、当サイト上で通知し、適宜ユーザーにお知らせします。
        </p>

        <p className="text-sm text-gray-500">最終更新日: 2025年3月9日</p>
      </div>
    </div>
  );
}