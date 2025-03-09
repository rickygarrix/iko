"use client";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">プライバシーポリシー</h1>

        <p className="mb-4">
          本プライバシーポリシーは、オトナビ（以下、「当サイト」）が提供するサービスにおいて、
          ユーザーの個人情報の取り扱いについて定めるものです。
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. 収集する情報</h2>
        <p className="mb-4">
          当サイトは、以下の種類の情報を収集することがあります。
          <ul className="list-disc pl-6">
            <li>ユーザーが提供する情報（名前、メールアドレス、プロフィール情報など）</li>
            <li>アクセス情報（IPアドレス、ブラウザ情報、閲覧履歴など）</li>
          </ul>
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. 情報の利用目的</h2>
        <p className="mb-4">
          収集した情報は、以下の目的で利用します。
          <ul className="list-disc pl-6">
            <li>サービスの提供・運営</li>
            <li>お問い合わせ対応</li>
            <li>利用状況の分析によるサービス改善</li>
            <li>不正行為の防止</li>
          </ul>
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. 情報の第三者提供</h2>
        <p className="mb-4">
          当サイトは、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません。
          <ul className="list-disc pl-6">
            <li>ユーザーの同意がある場合</li>
            <li>法律に基づく開示要請があった場合</li>
          </ul>
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. クッキー（Cookie）の利用</h2>
        <p className="mb-4">
          当サイトでは、利用状況を把握するためにクッキーを使用することがあります。
          クッキーはブラウザの設定で拒否することができますが、その場合、一部の機能が利用できなくなる可能性があります。
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. プライバシーポリシーの変更</h2>
        <p className="mb-4">
          本プライバシーポリシーは、予告なく変更されることがあります。
          変更後は、当サイト上で通知し、適宜ユーザーにお知らせします。
        </p>

        <p className="mt-6 text-gray-400">最終更新日: 2025年3月9日</p>

        <div className="mt-6">
          <Link href="/" className="text-blue-400 hover:underline">
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}