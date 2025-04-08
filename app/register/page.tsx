"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePendingStore } from "@/lib/store/pendingStore";

export default function StoreRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [regularHoliday, setRegularHoliday] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null); // ★ファイル保存
  const [error, setError] = useState("");

  const setPendingStore = usePendingStore((state) => state.setPendingStore);
  const pendingStore = usePendingStore((state) => state.pendingStore);

  // zustandから復元
  useEffect(() => {
    if (pendingStore) {
      setName(pendingStore.name || "");
      setGenre(pendingStore.genre || "");
      setAddress(pendingStore.address || "");
      setPhone(pendingStore.phone || "");
      setOpeningHours(pendingStore.opening_hours || "");
      setRegularHoliday(pendingStore.regular_holiday || "");
      setWebsiteUrl(pendingStore.website_url || "");
      setInstagramUrl(pendingStore.instagram_url || "");
      setPaymentMethods(pendingStore.payment_methods || []);
      setDescription(pendingStore.description || "");
      setImageUrl(pendingStore.image_url || "");
      setImageFile(pendingStore.image_file || null); // ★これも復元
    }
  }, [pendingStore]);

  const togglePaymentMethod = (method: string) => {
    if (paymentMethods.includes(method)) {
      setPaymentMethods(paymentMethods.filter((m) => m !== method));
    } else {
      setPaymentMethods([...paymentMethods, method]);
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !genre || !address || !description) {
      setError("必須項目をすべて入力してください。");
      return;
    }

    setPendingStore({
      name,
      genre,
      address,
      phone,
      opening_hours: openingHours,
      regular_holiday: regularHoliday,
      website_url: websiteUrl,
      instagram_url: instagramUrl,
      payment_methods: paymentMethods,
      description,
      image_url: imageUrl,
      image_file: imageFile, // ★ここ追加
    });

    router.push("/register/confirm");
  };

  return (
    <div className="min-h-screen bg-[#FEFCF6] flex justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">店舗登録フォーム</h1>

        <form className="space-y-6" onSubmit={handleConfirm}>
          {error && <p className="text-red-500 text-center">{error}</p>}

          {/* 店舗名 */}
          <div>
            <label className="block mb-1 font-medium text-gray-800">店舗名（必須）</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded p-2 text-gray-800" required />
          </div>

          {/* ジャンル */}
          <div>
            <label className="block mb-1 font-medium text-gray-800">ジャンル（必須）</label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full border rounded p-2 text-gray-800" required>
              <option value="">選択してください</option>
              <option value="クラブ">クラブ</option>
              <option value="ライブハウス">ライブハウス</option>
              <option value="ジャズバー">ジャズバー</option>
              <option value="その他">その他</option>
            </select>
          </div>

          {/* 住所 */}
          <div>
            <label className="block mb-1 font-medium text-gray-800">住所（必須）</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border rounded p-2 text-gray-800" required />
          </div>

          {/* 電話番号 */}
          <div>
            <label className="block mb-1 font-medium text-gray-800">電話番号</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded p-2 text-gray-800" />
          </div>

          {/* 営業時間 */}
          <div>
            <label className="block mb-1 font-medium text-gray-800">営業時間</label>
            <input type="text" value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} className="w-full border rounded p-2 text-gray-800" />
          </div>

          {/* 定休日 */}
          <div>
            <label className="block mb-1 font-medium text-gray-800">定休日</label>
            <input type="text" value={regularHoliday} onChange={(e) => setRegularHoliday(e.target.value)} className="w-full border rounded p-2 text-gray-800" />
          </div>

          {/* 公式サイトURL */}
          <div>
            <label className="block mb-1 font-medium text-gray-800">公式サイトURL</label>
            <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="w-full border rounded p-2 text-gray-800" />
          </div>

          {/* InstagramアカウントURL */}
          <div>
            <label className="block mb-1 font-medium text-gray-800">InstagramアカウントURL</label>
            <input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className="w-full border rounded p-2 text-gray-800" />
          </div>

          {/* 支払い方法 */}
          <div>
            <label className="block mb-1 font-medium text-gray-800">支払い方法（複数選択可）</label>
            <div className="flex flex-wrap gap-4 text-gray-800">
              {["現金", "クレジットカード", "電子マネー", "コード決済", "交通系IC", "その他"].map((method) => (
                <label key={method} className="flex items-center gap-2">
                  <input type="checkbox" checked={paymentMethods.includes(method)} onChange={() => togglePaymentMethod(method)} />
                  {method}
                </label>
              ))}
            </div>
          </div>

          {/* 説明文 */}
          <div>
            <label className="block mb-1 font-medium text-gray-800">簡単な説明文（必須）</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded p-2 text-gray-800" rows={5} required />
          </div>

          {/* 店舗画像アップロード */}
          <div>
            <label className="block mb-1 font-medium text-gray-800">店舗画像（任意）</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageUrl(URL.createObjectURL(file));
                  setImageFile(file); // ★ファイル保存も忘れず
                }
              }}
              className="w-full border rounded p-2 text-gray-800 bg-white"
            />
            {imageUrl && (
              <div className="mt-4">
                <p className="text-gray-700 text-sm mb-2">選択された画像プレビュー：</p>
                <img src={imageUrl} alt="店舗画像プレビュー" className="w-full rounded" />
              </div>
            )}
          </div>

          {/* 確認画面に進む */}
          <button type="submit" className="w-full bg-[#1F1F21] text-white rounded p-3 hover:bg-[#333]">
            確認画面に進む
          </button>
        </form>
      </div>
    </div>
  );
}