"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePendingStore } from "@/lib/store/pendingStore";
import { GENRES } from "@/constants/genres";
import { AREAS } from "@/constants/areas";
import { PAYMENTS } from "@/constants/payments";
import Image from "next/image";

const DAYS = ["月曜", "火曜", "水曜", "木曜", "金曜", "土曜", "日曜"];

export default function StoreRegisterPage() {
  const router = useRouter();
  const pendingStore = usePendingStore((state) => state.pendingStore); // ★ 追加！
  const setPendingStore = usePendingStore((state) => state.setPendingStore);

  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [startHours, setStartHours] = useState<string[]>(Array(7).fill(""));
  const [endHours, setEndHours] = useState<string[]>(Array(7).fill(""));
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  // 🌟 追加：pendingStoreから初期値を復元
  useEffect(() => {
    if (pendingStore) {
      setName(pendingStore.name || "");
      setGenre(pendingStore.genre || "");
      setArea(pendingStore.area || "");
      setAddress(pendingStore.address || "");
      setPhone(pendingStore.phone || "");
      setWebsiteUrl(pendingStore.website_url || "");
      setInstagramUrl(pendingStore.instagram_url || "");
      setPaymentMethods(pendingStore.payment_methods || []);
      setDescription(pendingStore.description || "");
      setImageUrl(pendingStore.image_url || "");
      setImageFile(pendingStore.image_file || null);

      // 営業時間だけ特別パース
      if (pendingStore.opening_hours) {
        const lines = pendingStore.opening_hours.split("\n");
        const startList: string[] = [];
        const endList: string[] = [];
        lines.forEach((line) => {
          const day = DAYS.find((d) => line.startsWith(d));
          if (day) {
            const timePart = line.replace(day, "").trim();
            if (timePart === "休み") {
              startList.push("休み");
              endList.push("");
            } else {
              const [start, end] = timePart.split("〜");
              startList.push(start || "");
              endList.push(end || "");
            }
          }
        });
        setStartHours(startList);
        setEndHours(endList);
      }
    }
  }, [pendingStore]);

  const togglePaymentMethod = (method: string) => {
    setPaymentMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const setAsHoliday = (idx: number) => {
    const newStarts = [...startHours];
    const newEnds = [...endHours];
    newStarts[idx] = "休み";
    newEnds[idx] = "";
    setStartHours(newStarts);
    setEndHours(newEnds);
  };

  const clearHoliday = (idx: number) => {
    const newStarts = [...startHours];
    const newEnds = [...endHours];
    newStarts[idx] = "";
    newEnds[idx] = "";
    setStartHours(newStarts);
    setEndHours(newEnds);
  };

  const handleConfirm = () => {
    if (!name || !genre || !area || !address || !description) {
      setError("必須項目をすべて入力してください。");
      return;
    }

    const openingHoursList = startHours.map((start, idx) => {
      const end = endHours[idx];
      if (start === "休み") return `${DAYS[idx]} 休み`;
      if (!start || !end) return `${DAYS[idx]} 休み`;
      return `${DAYS[idx]} ${start}〜${end}`;
    });

    setPendingStore({
      name,
      genre,
      area,
      address,
      phone,
      opening_hours: openingHoursList.join("\n"),
      regular_holiday: "",
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
    <div className="min-h-screen bg-[#FEFCF6] pt-24 px-10 pb-10 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-8">店舗登録フォーム</h1>

      <div className="space-y-6">
        <InputField label="店舗名 (必須)" value={name} setValue={setName} />
        <RadioGroup label="ジャンル (必須)" options={GENRES} selected={genre} setSelected={setGenre} />
        <RadioGroup label="エリア (必須)" options={AREAS} selected={area} setSelected={setArea} />
        <InputField label="住所 (必須)" value={address} setValue={setAddress} />
        <InputField label="電話番号" value={phone} setValue={setPhone} />

        {/* 営業時間 */}
        <div>
          <p className="text-sm text-gray-600 mb-2">営業時間</p>
          {DAYS.map((day, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <div className="w-12">{day}</div>
              {startHours[idx] === "休み" ? (
                <div className="text-red-500 flex items-center">
                  休み
                  <button type="button" onClick={() => clearHoliday(idx)} className="ml-2 text-sm text-blue-600 underline">
                    クリア
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={startHours[idx]}
                    onChange={(e) => {
                      const updated = [...startHours];
                      updated[idx] = e.target.value;
                      setStartHours(updated);
                    }}
                    className="border p-2 rounded w-20"
                    placeholder="18:00"
                  />
                  <span>〜</span>
                  <input
                    type="text"
                    value={endHours[idx]}
                    onChange={(e) => {
                      const updated = [...endHours];
                      updated[idx] = e.target.value;
                      setEndHours(updated);
                    }}
                    className="border p-2 rounded w-20"
                    placeholder="28:00"
                  />
                  <button type="button" onClick={() => setAsHoliday(idx)} className="ml-2 text-sm text-blue-600 underline">
                    休み
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <CheckboxGroup label="支払い方法" options={PAYMENTS} selected={paymentMethods} setSelected={setPaymentMethods} />
        <InputField label="公式サイトURL" value={websiteUrl} setValue={setWebsiteUrl} />
        <InputField label="InstagramアカウントURL" value={instagramUrl} setValue={setInstagramUrl} />
        <TextAreaField label="店舗説明 (必須)" value={description} setValue={setDescription} />

        {/* 店舗画像 */}
        <div>
          <p className="text-sm text-gray-600 mb-2">店舗画像（任意）</p>
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
            className="w-full border rounded p-2 bg-white"
          />
          {imageUrl && (
            <div className="relative w-64 h-40 mx-auto mt-4">
              <Image src={imageUrl} alt="店舗画像プレビュー" fill className="object-contain rounded" />
            </div>
          )}
        </div>

        {/* エラー */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* ボタン */}
        <div className="space-y-4 mt-8">
          <button onClick={handleConfirm} className="w-full bg-[#1F1F21] text-white rounded p-3 hover:bg-[#333]">
            確認画面に進む
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, setValue }: { label: string; value: string; setValue: (v: string) => void }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border p-2 rounded"
      />
    </div>
  );
}

function TextAreaField({ label, value, setValue }: { label: string; value: string; setValue: (v: string) => void }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border p-2 rounded"
        rows={5}
      />
    </div>
  );
}

function RadioGroup({ label, options, selected, setSelected }: { label: string; options: string[]; selected: string; setSelected: (v: string) => void }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex flex-wrap gap-4">
        {options.map((o) => (
          <label key={o} className="flex items-center gap-2">
            <input
              type="radio"
              name={label}
              value={o}
              checked={selected === o}
              onChange={(e) => setSelected(e.target.value)}
            />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup({ label, options, selected, setSelected }: { label: string; options: string[]; selected: string[]; setSelected: (v: string[]) => void }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex flex-wrap gap-4">
        {options.map((o) => (
          <label key={o} className="flex items-center gap-2">
            <input
              type="checkbox"
              value={o}
              checked={selected.includes(o)}
              onChange={(e) => {
                const updated = e.target.checked
                  ? [...selected, o]
                  : selected.filter((item) => item !== o);
                setSelected(updated);
              }}
            />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}