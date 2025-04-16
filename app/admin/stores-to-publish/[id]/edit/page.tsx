"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { GENRES } from "@/constants/genres";
import { AREAS } from "@/constants/areas";
import { PAYMENTS } from "@/constants/payments";
import Image from "next/image";

const DAYS = ["月曜", "火曜", "水曜", "木曜", "金曜", "土曜", "日曜"];

type Option = { key: string; label: string };

// 型定義追加
type ParsedStoreData = {
  name?: string;
  genre?: string;
  area?: string;
  address?: string;
  phone?: string;
  openingHoursList?: string[];
  websiteUrl?: string;
  instagramUrl?: string;
  paymentMethods?: string[];
  description?: string;
  imageUrl?: string;
  storeInstagram1?: string;
  storeInstagram2?: string;
  storeInstagram3?: string;
};

export default function StoreToPublishEditPage() {
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
    if (!time) return true;
    const regex = /^[0-9]{1,2}:[0-9]{2}$/;
    return regex.test(time);
  };

  const setFields = (parsed: ParsedStoreData) => {
    setName(parsed.name ?? "");
    setGenre(parsed.genre ?? "");
    setArea(parsed.area ?? "");
    setAddress(parsed.address ?? "");
    setPhone(parsed.phone ?? "");
    const starts = parsed.openingHoursList?.map((time) => time.split("〜")[0]) || Array(7).fill("");
    const ends = parsed.openingHoursList?.map((time) => time.split("〜")[1]) || Array(7).fill("");
    setStartHours(starts);
    setEndHours(ends);
    setWebsiteUrl(parsed.websiteUrl ?? "");
    setInstagramUrl(parsed.instagramUrl ?? "");
    setPaymentMethods(parsed.paymentMethods ?? []);
    setDescription(parsed.description ?? "");
    setImageUrl(parsed.imageUrl ?? "");
    setStoreInstagram1(parsed.storeInstagram1 ?? "");
    setStoreInstagram2(parsed.storeInstagram2 ?? "");
    setStoreInstagram3(parsed.storeInstagram3 ?? "");
  };

  useEffect(() => {
    const fetchStore = async () => {
      const sessionData = sessionStorage.getItem("editStoreData");
      if (sessionData) {
        const parsed: ParsedStoreData = JSON.parse(sessionData);
        setFields(parsed);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .eq("is_published", false)
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

    if (id) fetchStore();
  }, [id]);

  const parseOpeningHoursText = (text: string): string[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    return DAYS.map((day) => {
      const found = lines.find((line) => line.startsWith(day));
      return found ? found.slice(day.length + 1).trim() : "";
    });
  };

  const handleConfirm = () => {
    const openingHoursTextList = startHours.map((start, idx) => {
      const end = endHours[idx];
      if (start === "休み") return `${DAYS[idx]} 休み`;
      if (!start || !end) return `${DAYS[idx]} 休み`;
      return `${DAYS[idx]} ${start}〜${end}`;
    });

    const storeData: ParsedStoreData = {
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
      <h1 className="text-2xl font-bold text-center mb-8">未公開店舗編集</h1>
      <div className="space-y-4">
        <InputField label="店舗名" value={name} setValue={setName} />
        <RadioGroup label="ジャンル" options={GENRES} selected={genre} setSelected={setGenre} />
        <RadioGroup label="エリア" options={AREAS} selected={area} setSelected={setArea} />
        <InputField label="住所" value={address} setValue={setAddress} />
        <InputField label="電話番号" value={phone} setValue={setPhone} />

        <div>
          <p className="text-sm text-gray-600 mb-2">営業時間</p>
          {DAYS.map((day, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <div className="w-12">{day}</div>
              {startHours[idx] === "休み" ? (
                <div className="text-red-500 flex items-center">
                  休み
                  <button onClick={() => clearHoliday(idx)} className="ml-2 text-sm text-blue-600 underline">
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
                    className={`border p-2 rounded w-20 ${isValidTimeFormat(startHours[idx]) ? "" : "border-red-500"}`}
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
                    className={`border p-2 rounded w-20 ${isValidTimeFormat(endHours[idx]) ? "" : "border-red-500"}`}
                    placeholder="28:00"
                  />
                  <button onClick={() => setAsHoliday(idx)} className="ml-2 text-sm text-blue-600 underline">
                    休み
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <CheckboxGroup label="支払い方法" options={PAYMENTS} selected={paymentMethods} setSelected={setPaymentMethods} />
        <InputField label="公式サイト" value={websiteUrl} setValue={setWebsiteUrl} />
        <InputField label="Instagramアカウント" value={instagramUrl} setValue={setInstagramUrl} />
        <InputField label="Instagram投稿リンク1" value={storeInstagram1} setValue={setStoreInstagram1} />
        <InputField label="Instagram投稿リンク2" value={storeInstagram2} setValue={setStoreInstagram2} />
        <InputField label="Instagram投稿リンク3" value={storeInstagram3} setValue={setStoreInstagram3} />
        <TextAreaField label="店舗説明" value={description} setValue={setDescription} />

        {imageUrl && (
          <div className="relative w-full max-w-xs h-60 mx-auto mb-4 rounded overflow-hidden border">
            <Image src={imageUrl} alt="店舗画像" fill style={{ objectFit: "cover" }} sizes="100%" unoptimized />
          </div>
        )}

        <div className="space-y-4 mt-8">
          <button onClick={() => router.push("/admin/stores-to-publish")} className="w-full bg-gray-500 text-white rounded p-3 hover:bg-gray-600">
            詳細画面に戻る
          </button>
          <button onClick={handleConfirm} className="w-full bg-[#1F1F21] text-white rounded p-3 hover:bg-[#333]">
            確認する
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
      <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="w-full border p-2 rounded" />
    </div>
  );
}

function TextAreaField({ label, value, setValue }: { label: string; value: string; setValue: (v: string) => void }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <textarea value={value} onChange={(e) => setValue(e.target.value)} className="w-full border p-2 rounded" rows={5} />
    </div>
  );
}

function RadioGroup({ label, options, selected, setSelected }: { label: string; options: Option[]; selected: string; setSelected: (v: string) => void }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex flex-wrap gap-4">
        {options.map((o) => (
          <label key={o.key} className="flex items-center gap-2">
            <input
              type="radio"
              name={label}
              value={o.key}
              checked={selected === o.key}
              onChange={(e) => setSelected(e.target.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup({ label, options, selected, setSelected }: { label: string; options: Option[]; selected: string[]; setSelected: (v: string[]) => void }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex flex-wrap gap-4">
        {options.map((o) => (
          <label key={o.key} className="flex items-center gap-2">
            <input
              type="checkbox"
              value={o.key}
              checked={selected.includes(o.key)}
              onChange={(e) => {
                const updated = e.target.checked
                  ? [...selected, o.key]
                  : selected.filter((item) => item !== o.key);
                setSelected(updated);
              }}
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}