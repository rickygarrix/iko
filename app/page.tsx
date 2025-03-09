"use client";

declare global {
  interface Window {
    stores: Store[];
  }
}

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import isBetween from "dayjs/plugin/isBetween";
import SearchFilter from "@/components/SearchFilter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedText from "@/components/AnimatedText";

dayjs.extend(isBetween);

// 店舗データの型
type Store = {
  id: string;
  name: string;
  genre: string;
  capacity: number;
  area: string;
  payment_methods: string[];
  opening_hours: string;
  image_url?: string | null;
};

export default function Home() {
  const router = useRouter();

  // 🔹 フィルターの状態管理
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);

  // 🔹 おすすめのハコ
  const [recommendedStores, setRecommendedStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Supabaseからおすすめのハコを取得（3店舗のみ表示）
  useEffect(() => {
    const fetchRecommendedStores = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .limit(3);

      console.log("📦 Supabase から取得した data:", data); // ✅ 取得データを確認

      if (error) {
        console.error("🔥 Supabase Error:", error.message);
        setRecommendedStores([]);
      } else {
        setRecommendedStores(data || []);
      }
      setLoading(false);
    };

    fetchRecommendedStores();
  }, []);

  // ✅ `stores` を `window.stores` に保存して Console で確認できるようにする
  useEffect(() => {
    console.log("📦 取得した recommendedStores:", recommendedStores);
    window.stores = recommendedStores; // ✅ 追加
  }, [recommendedStores]);

  // 🔹 検索ボタンの動作
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedGenres.length > 0) params.append("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.append("area", selectedAreas.join(","));
    if (selectedPayments.length > 0) params.append("payment", selectedPayments.join(","));
    if (showOnlyOpen) params.append("open", "true");

    router.push(`/search?${params.toString()}`);
  };

  // 🔹 営業時間判定関数
  const checkIfOpen = (opening_hours: string) => {
    const now = dayjs().locale("ja");
    const today = now.format("dddd").trim();
    const tomorrow = now.add(1, "day").format("dddd").trim();

    console.log(`📆 現在の曜日: '${today}'`);
    console.log(`📆 明日の曜日: '${tomorrow}'`);
    console.log(`🔍 Supabase から取得した営業時間のデータ:`, opening_hours);

    // ✅ `opening_hours` を改行で分割してオブジェクトに変換
    const hoursMap: { [key: string]: string } = {};
    opening_hours.split("\n").forEach((line) => {
      const match = line.match(/^(.+?日)\s*(.+)$/); // 修正: `日曜日 13` を正しく処理
      if (match) {
        const day = match[1].trim();
        const hours = match[2].trim();
        hoursMap[day] = hours;
      }
    });

    console.log("🗺 営業時間マップ:", hoursMap);
    console.log("🔍 検索対象:", today);

    // 🔥 修正: `today` のキーを適切に処理する
    const foundKey = Object.keys(hoursMap).find((key) => key.startsWith(today));

    if (!foundKey) {
      console.error(`⚠️ '${today}' のデータが見つかりません`);
      return { isOpen: false, nextOpening: "情報なし" };
    }

    const todayHours = hoursMap[foundKey] || "情報なし";

    console.log(`📆 今日(${today}) の営業時間:`, todayHours);

    if (!todayHours || todayHours === "情報なし") {
      return { isOpen: false, nextOpening: "情報なし" };
    }

    if (todayHours.includes("休み")) {
      return { isOpen: false, nextOpening: "本日休業" };
    }

    // ✅ "13:00〜翌00:30" のようなデータから時間部分を抽出
    const timeRanges = todayHours.split(", ");

    for (const range of timeRanges) {
      let [openTime, closeTime] = range.split("〜").map((t) => t.trim());

      if (closeTime.includes("翌")) {
        closeTime = closeTime.replace("翌", "").trim();
        closeTime = now.add(1, "day").format("YYYY-MM-DD") + ` ${closeTime}`;
      } else {
        closeTime = now.format("YYYY-MM-DD") + ` ${closeTime}`;
      }
      openTime = now.format("YYYY-MM-DD") + ` ${openTime}`;

      const open = dayjs(openTime, "YYYY-MM-DD HH:mm");
      const close = dayjs(closeTime, "YYYY-MM-DD HH:mm");

      console.log(`🕒 営業時間: ${open.format("HH:mm")} 〜 ${close.format("HH:mm")}`);

      if (now.isBetween(open, close, null, "[)")) {
        return { isOpen: true, nextOpening: `本日 ${close.format("HH:mm")} まで営業` };
      }
    }

    const nextOpenTime = hoursMap[tomorrow]?.split("〜")[0].trim();
    if (nextOpenTime) {
      return { isOpen: false, nextOpening: `次の営業: ${tomorrow} ${nextOpenTime} から` };
    }

    return { isOpen: false, nextOpening: "営業時間外" };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <SearchFilter
        selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres}
        selectedAreas={selectedAreas} setSelectedAreas={setSelectedAreas}
        selectedPayments={selectedPayments} setSelectedPayments={setSelectedPayments}
        showOnlyOpen={showOnlyOpen} setShowOnlyOpen={setShowOnlyOpen}
        handleSearch={handleSearch}
      />

      <AnimatedText />

      <h2 className="text-lg font-semibold mt-6">今月のおすすめのハコ</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {recommendedStores.map((store) => {
          const { isOpen, nextOpening } = checkIfOpen(store.opening_hours);
          return (
            <Link key={store.id} href={`/stores/${store.id}`} passHref>
              <div className="p-4 bg-gray-800 rounded shadow flex">
                <img
                  src={store.image_url ?? "/default-image.jpg"}
                  alt={store.name}
                  className="w-32 h-32 object-cover rounded"
                />
                <div className="ml-4 flex flex-col justify-between">
                  <h2 className="text-xl font-semibold">{store.name}</h2>
                  <p className="text-gray-300">📍: {store.area}</p>
                  <p className={isOpen ? "text-green-400" : "text-red-400"}>🕗 {isOpen ? "営業中" : "営業時間外"}</p>
                  <p className="text-white">{nextOpening}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}