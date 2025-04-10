"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/uploadImage";
import Image from "next/image"; // ⭐️ 追加

type Store = {
  id: string;
  name: string;
  genre: string;
  address: string;
  phone: string;
  opening_hours: string;
  regular_holiday: string;
  website_url: string;
  instagram_url: string;
  payment_methods: string[];
  description: string;
  image_url: string;
};

export default function StoreEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchStore = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .single<Store>();

      if (error) {
        console.error("取得エラー:", error);
      } else {
        setStore(data);
        setName(data.name);
        setGenre(data.genre);
        setAddress(data.address);
        setPhone(data.phone);
        setOpeningHours(data.opening_hours);
        setRegularHoliday(data.regular_holiday);
        setWebsiteUrl(data.website_url);
        setInstagramUrl(data.instagram_url);
        setPaymentMethods(data.payment_methods);
        setDescription(data.description);
        setImageUrl(data.image_url);
      }
      setLoading(false);
    };

    if (id) {
      fetchStore();
    }
  }, [id]);

  const handleSave = async () => {
    if (!store) return;

    let newImageUrl = imageUrl;

    if (imageFile) {
      const filePath = `stores/${store.id}/${Date.now()}_${imageFile.name}`;
      newImageUrl = await uploadImage(imageFile, filePath);
    }

    const { error } = await supabase
      .from("stores")
      .update({
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
        image_url: newImageUrl,
      })
      .eq("id", store.id);

    if (error) {
      alert("書き込み失敗しました");
      return;
    }

    alert("保存が完了しました！");
    router.push("/admin/stores");
  };

  if (loading) {
    return <div className="text-center p-10">読み込み中...</div>;
  }

  if (!store) {
    return <div className="text-center p-10">データが見つかりませんでした</div>;
  }

  return (
    <div className="min-h-screen bg-[#FEFCF6] p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow space-y-6">
        <h1 className="text-2xl font-bold text-center">店舗情報編集</h1>

        {/* 入力フォーム */}
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="店舗名" className="w-full border p-2 rounded" />
        <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="ジャンル" className="w-full border p-2 rounded" />
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="住所" className="w-full border p-2 rounded" />
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="電話番号" className="w-full border p-2 rounded" />
        <input type="text" value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} placeholder="営業時間" className="w-full border p-2 rounded" />
        <input type="text" value={regularHoliday} onChange={(e) => setRegularHoliday(e.target.value)} placeholder="定休日" className="w-full border p-2 rounded" />
        <input type="text" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="公式サイトURL" className="w-full border p-2 rounded" />
        <input type="text" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="Instagram URL" className="w-full border p-2 rounded" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="店舗説明" className="w-full border p-2 rounded" rows={5} />

        {/* 画像アップロード */}
        <div>
          <p className="text-sm text-gray-600 mb-2">現在の画像：</p>
          {imageUrl && (
            <div className="relative w-full max-w-xs h-60 mx-auto mb-4 rounded overflow-hidden border">
              <Image
                src={imageUrl}
                alt="現在の画像"
                fill
                style={{ objectFit: "cover" }}
                sizes="100%"
                unoptimized
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImageFile(file);
                setImageUrl(URL.createObjectURL(file));
              }
            }}
            className="w-full border p-2 rounded bg-white"
          />
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          className="w-full bg-[#1F1F21] text-white rounded p-3 hover:bg-[#333]"
        >
          保存する
        </button>
      </div>
    </div>
  );
}