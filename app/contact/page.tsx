"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useContactStore } from "@/lib/store/contactStore"; // ★ zustandからstore呼び出し！

export default function ContactPage() {
  const router = useRouter();

  // zustandから現在の入力データを取得
  const contact = useContactStore((state) => state.contact);
  const setContact = useContactStore((state) => state.setContact);

  // 取得したデータを初期値にセット！
  const [category, setCategory] = useState(contact.category || "");
  const [email, setEmail] = useState(contact.email || "");
  const [name, setName] = useState(contact.name || "");
  const [subject, setSubject] = useState(contact.subject || "");
  const [message, setMessage] = useState(contact.message || "");
  const [error, setError] = useState("");

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name) {
      setError("お名前とメールアドレスは必須項目です。");
      return;
    }

    setError("");

    // フォーム内容をzustandに保存して、確認画面へ遷移！
    setContact({ category, email, name, subject, message });
    router.push("/contact/confirm");
  };

  return (
    <div className="min-h-screen bg-[#FEFCF6] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg p-8 text-gray-800">
        <h1 className="text-2xl font-bold text-center mb-6">お問い合わせ</h1>
        <p className="text-center text-gray-600 mb-8">
          ご質問・ご相談は、こちらからお気軽にお問い合わせください。
        </p>

        <form className="space-y-6" onSubmit={handleConfirm}>
          {/* エラーメッセージ */}
          {error && (
            <div className="text-red-500 text-sm font-semibold mb-4 text-center">
              {error}
            </div>
          )}

          {/* メールアドレス */}
          <div>
            <label className="block text-sm font-medium mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded p-2 text-gray-800"
              required
            />
          </div>

          {/* お名前 */}
          <div>
            <label className="block text-sm font-medium mb-1">お名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded p-2 text-gray-800"
              required
            />
          </div>

          {/* 件名 */}
          <div>
            <label className="block text-sm font-medium mb-1">件名</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border rounded p-2 text-gray-800"
            />
          </div>

          {/* お問い合わせ内容 */}
          <div>
            <label className="block text-sm font-medium mb-1">お問い合わせ内容詳細</label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border rounded p-2 text-gray-800"
              required
            />
          </div>

          {/* 確認画面に進むボタン */}
          <button
            type="submit"
            className="w-full bg-[#1F1F21] text-white rounded p-3 hover:bg-[#333]"
          >
            確認画面に進む
          </button>
        </form>
      </div>
    </div>
  );
}