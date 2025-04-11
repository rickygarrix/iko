"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { GENRES } from "@/constants/genres";
import { AREAS } from "@/constants/areas";
import { PAYMENTS } from "@/constants/payments";

const DAYS = ["月曜", "火曜", "水曜", "木曜", "金曜", "土曜", "日曜"];

export default function StoreEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);

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
  const [storeInstagram1, setStoreInstagram1] = useState("");
  const [storeInstagram2, setStoreInstagram2] = useState("");
  const [storeInstagram3, setStoreInstagram3] = useState("");

  const clearHoliday = (idx: number) => {
    const newStarts = [...startHours];
    const newEnds = [...endHours];
    newStarts[idx] = "";
    newEnds[idx] = "";
    setStartHours(newStarts);
    setEndHours(newEnds);
  };

  const isValidTimeFormat = (time: string): boolean => {
    if (!time) return true; // 空欄はOKにする
    const regex = /^[0-9]{1,2}:[0-9]{2}$/;
    return regex.test(time);
  };

  useEffect(() => {
    const fetchStore = async () => {
      const sessionData = sessionStorage.getItem("editStoreData");
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        setFields(parsed);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("取得エラー:", error);
      } else {
        setFields({
          name: data.name,
          genre: data.genre,
          area: data.area,
          address: data.address,
          phone: data.phone,
          openingHoursList: parseOpeningHoursText(data.opening_hours),
          websiteUrl: data.website,
          instagramUrl: data.instagram,
          paymentMethods: data.payment_methods || [],
          description: data.description,
          imageUrl: data.image_url,
          storeInstagram1: data.store_instagrams || "",
          storeInstagram2: data.store_instagrams2 || "",
          storeInstagram3: data.store_instagrams3 || "",
        });
      }
      setLoading(false);
    };

    if (id) {
      fetchStore();
    }
  }, [id]);

  const setFields = (parsed: any) => {
    setName(parsed.name ?? ""); // ←これ！
    setGenre(parsed.genre ?? "");
    setArea(parsed.area ?? "");
    setAddress(parsed.address ?? "");
    setPhone(parsed.phone ?? "");
    const starts = parsed.openingHoursList?.map((time: string) =>
      time?.split("〜")[0] ?? ""
    ) || Array(7).fill(""); // ←nullでも空文字にする
    const ends = parsed.openingHoursList?.map((time: string) =>
      time?.split("〜")[1] ?? ""
    ) || Array(7).fill(""); // ←同様
    setStartHours(starts);
    setEndHours(ends);
    setWebsiteUrl(parsed.websiteUrl ?? "");
    setInstagramUrl(parsed.instagramUrl ?? "");
    setPaymentMethods(parsed.paymentMethods || []);
    setDescription(parsed.description ?? "");
    setImageUrl(parsed.imageUrl ?? "");
    setStoreInstagram1(parsed.storeInstagram1 ?? "");
    setStoreInstagram2(parsed.storeInstagram2 ?? "");
    setStoreInstagram3(parsed.storeInstagram3 ?? "");
  };

  const parseOpeningHoursText = (text: string): string[] => {
    const lines = text.split("\n").filter(line => line.trim());
    return DAYS.map(day => {
      const found = lines.find(line => line.startsWith(day));
      if (!found) return "";
      return found.slice(day.length + 1).trim();
    });
  };

  const handleConfirm = () => {
    const openingHoursTextList = startHours.map((start, idx) => {
      const end = endHours[idx];
      if (start === "休み") return `${DAYS[idx]} 休み`;
      if (!start || !end) return `${DAYS[idx]} 休み`;
      return `${DAYS[idx]} ${start}〜${end}`;
    });

    const storeData = {
      name,
      genre,
      area,
      address,
      phone,
      openingHoursList: openingHoursTextList,
      websiteUrl,
      instagramUrl,
      paymentMethods,
      description,
      imageUrl,
      storeInstagram1,
      storeInstagram2,
      storeInstagram3,
    };

    sessionStorage.setItem("editStoreData", JSON.stringify(storeData));
    router.push(`/admin/stores/${id}/confirm`);
  };

  const setAsHoliday = (idx: number) => {
    const newStarts = [...startHours];
    const newEnds = [...endHours];
    newStarts[idx] = "休み";
    newEnds[idx] = "";
    setStartHours(newStarts);
    setEndHours(newEnds);
  };

  if (loading) return <div className="text-center p-10">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-[#FEFCF6] pt-24 px-10 pb-10 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-8">店舗情報編集</h1>

      <div className="space-y-4">
        {/* 入力フォーム */}
        <InputField label="店舗名" value={name} setValue={setName} />
        <RadioGroup label="ジャンル" options={GENRES} selected={genre} setSelected={setGenre} />
        <RadioGroup label="エリア" options={AREAS} selected={area} setSelected={setArea} />
        <InputField label="住所" value={address} setValue={setAddress} />
        <InputField label="電話番号" value={phone} setValue={setPhone} />

        {/* 営業時間入力 */}
        <div>
          <p className="text-sm text-gray-600 mb-2">営業時間</p>
          {DAYS.map((day, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <div className="w-12">{day}</div>
              {startHours[idx] === "休み" ? (
                <div className="text-red-500 flex items-center">
                  休み
                  <button
                    onClick={() => clearHoliday(idx)}
                    className="ml-2 text-sm text-blue-600 underline"
                  >
                    クリア
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={startHours[idx] || ""}
                    onChange={(e) => {
                      const updated = [...startHours];
                      updated[idx] = e.target.value;
                      setStartHours(updated);
                    }}
                    className={`border p-2 rounded w-20 ${isValidTimeFormat(startHours[idx]) ? "" : "border-red-500"
                      }`}
                    placeholder="18:00"
                  />
                  <span>〜</span>
                  <input
                    type="text"
                    value={endHours[idx] || ""}
                    onChange={(e) => {
                      const updated = [...endHours];
                      updated[idx] = e.target.value;
                      setEndHours(updated);
                    }}
                    className={`border p-2 rounded w-20 ${isValidTimeFormat(endHours[idx]) ? "" : "border-red-500"
                      }`}
                    placeholder="28:00"
                  />
                  <button
                    onClick={() => setAsHoliday(idx)}
                    className="ml-2 text-sm text-blue-600 underline"
                  >
                    休み
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* その他入力 */}
        <CheckboxGroup label="支払い方法" options={PAYMENTS} selected={paymentMethods} setSelected={setPaymentMethods} />
        <InputField label="公式サイト" value={websiteUrl} setValue={setWebsiteUrl} />
        <InputField label="Instagramアカウント" value={instagramUrl} setValue={setInstagramUrl} />
        <InputField label="Instagram投稿リンク1" value={storeInstagram1} setValue={setStoreInstagram1} />
        <InputField label="Instagram投稿リンク2" value={storeInstagram2} setValue={setStoreInstagram2} />
        <InputField label="Instagram投稿リンク3" value={storeInstagram3} setValue={setStoreInstagram3} />
        <TextAreaField label="店舗説明" value={description} setValue={setDescription} />

        {/* 画像表示 */}
        {imageUrl && (
          <div className="relative w-full max-w-xs h-60 mx-auto mb-4 rounded overflow-hidden border">
            <Image src={imageUrl} alt="店舗画像" fill style={{ objectFit: "cover" }} sizes="100%" unoptimized />
          </div>
        )}

        {/* ボタン */}
        <div className="space-y-4 mt-8">
          <button
            onClick={() => router.push(`/admin/stores/${id}`)}
            className="w-full bg-gray-500 text-white rounded p-3 hover:bg-gray-600"
          >
            戻る
          </button>
          <button
            onClick={handleConfirm}
            className="w-full bg-[#1F1F21] text-white rounded p-3 hover:bg-[#333]"
          >
            確認する
          </button>
        </div>
      </div>
    </div>
  );
}

/* 以降、パーツコンポーネントたち */
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