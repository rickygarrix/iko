"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePendingStore } from "@/lib/store/pendingStore";
import Image from "next/image"; // ← ★追加！

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const setPendingStore = usePendingStore((state) => state.setPendingStore);
  const pendingStore = usePendingStore((state) => state.pendingStore);

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
      setImageFile(pendingStore.image_file || null);
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
      image_file: imageFile,
    });

    router.push("/register/confirm");
  };

  return (
    <div className="min-h-screen bg-[#FEFCF6] flex justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">店舗登録フォーム</h1>

        <form className="space-y-6" onSubmit={handleConfirm}>
          {error && <p className="text-red-500 text-center">{error}</p>}

          {/* 入力フィールド群 */}
          <Input label="店舗名（必須）" value={name} onChange={setName} required />
          <SelectGenre genre={genre} setGenre={setGenre} />
          <Input label="住所（必須）" value={address} onChange={setAddress} required />
          <Input label="電話番号" value={phone} onChange={setPhone} />
          <Input label="営業時間" value={openingHours} onChange={setOpeningHours} />
          <Input label="定休日" value={regularHoliday} onChange={setRegularHoliday} />
          <Input label="公式サイトURL" value={websiteUrl} onChange={setWebsiteUrl} type="url" />
          <Input label="InstagramアカウントURL" value={instagramUrl} onChange={setInstagramUrl} type="url" />

          {/* 支払い方法 */}
          <div>
            <label className="block mb-1 font-medium text-gray-800">支払い方法（複数選択可）</label>
            <div className="flex flex-wrap gap-4 text-gray-800">
              {["現金", "クレジットカード", "電子マネー", "コード決済", "交通系IC", "その他"].map((method) => (
                <label key={method} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paymentMethods.includes(method)}
                    onChange={() => togglePaymentMethod(method)}
                  />
                  {method}
                </label>
              ))}
            </div>
          </div>

          {/* 説明文 */}
          <div>
            <label className="block mb-1 font-medium text-gray-800">簡単な説明文（必須）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded p-2 text-gray-800"
              rows={5}
              required
            />
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
                  setImageFile(file);
                }
              }}
              className="w-full border rounded p-2 text-gray-800 bg-white"
            />
            {imageUrl && (
              <div className="mt-4 flex justify-center">
                <div className="relative w-64 h-40">
                  <Image
                    src={imageUrl}
                    alt="店舗画像プレビュー"
                    fill
                    className="object-contain rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 確認画面へ */}
          <button type="submit" className="w-full bg-[#1F1F21] text-white rounded p-3 hover:bg-[#333]">
            確認画面に進む
          </button>
        </form>
      </div>
    </div>
  );
}

// 小コンポーネント群
function Input({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block mb-1 font-medium text-gray-800">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded p-2 text-gray-800"
        required={required}
      />
    </div>
  );
}

function SelectGenre({ genre, setGenre }: { genre: string; setGenre: (v: string) => void }) {
  return (
    <div>
      <label className="block mb-1 font-medium text-gray-800">ジャンル（必須）</label>
      <select
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        className="w-full border rounded p-2 text-gray-800"
        required
      >
        <option value="">選択してください</option>
        <option value="クラブ">クラブ</option>
        <option value="ライブハウス">ライブハウス</option>
        <option value="ジャズバー">ジャズバー</option>
        <option value="その他">その他</option>
      </select>
    </div>
  );
}