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

  const checkIfOpen = (opening_hours: string) => {
    const nowRaw = dayjs().locale("ja"); // ✅ 現在の時刻を取得
    let now = nowRaw;

    // ✅ 朝6時より前なら前日扱い
    if (nowRaw.hour() < 6) {
        now = nowRaw.subtract(1, "day");
    }

    let today = convertToJapaneseDay(now.format("dddd"));  // ✅ "金曜" に変換
    let tomorrow = convertToJapaneseDay(now.add(1, "day").format("dddd"));
    const currentTime = nowRaw.format("HH:mm"); // 現在の正確な時刻を取得

    console.log(`📆 現在の曜日: '${today}', 時刻: ${currentTime}`);
    console.log(`🔍 Supabase から取得した営業時間のデータ:`, opening_hours);

    // ✅ 営業時間マップを作成
    const hoursMap: { [key: string]: { open: string; close: string }[] } = {};
    opening_hours.split("\n").forEach((line) => {
        const match = line.match(/^(.+?曜)\s*(.+)$/);
        if (match) {
            const day = match[1].trim();
            let hoursList = match[2].trim().split(", ");

            hoursMap[day] = hoursList.map((hours) => {
                const [openTime, closeTime] = hours.split("〜").map((t) => t.trim());
                return { open: openTime, close: closeTime };
            });
        }
    });

    console.log("🗺 営業時間マップのキー:", Object.keys(hoursMap));

    console.log("🔍 検索対象:", today);

    const foundKey = Object.keys(hoursMap).find((key) => key.startsWith(today));

    if (!foundKey) {
        console.error(`⚠️ '${today}' のデータが見つかりません`);
        return { isOpen: false, nextOpening: "情報なし" };
    }

    const todayHours = hoursMap[foundKey] || [];
    console.log(`📆 今日(${today}) の営業時間:`, todayHours);

    if (!todayHours.length) {
        return { isOpen: false, nextOpening: "情報なし" };
    }

    let nextOpening = "";
    let isOpen = false;

    for (const period of todayHours) {
        let openHour = parseInt(period.open.split(":")[0], 10);
        let openMinute = parseInt(period.open.split(":")[1], 10);
        let closeHour = parseInt(period.close.split(":")[0], 10);
        let closeMinute = parseInt(period.close.split(":")[1], 10);

        let open = now.set("hour", openHour).set("minute", openMinute);
        let close = now.set("hour", closeHour).set("minute", closeMinute);

        // ✅ 24時以降の営業時間を「翌日」にする処理
        if (closeHour >= 24) {
            closeHour -= 24;
            close = now.add(1, "day").set("hour", closeHour).set("minute", closeMinute);
        }

        console.log(`🕒 営業時間: ${open.format("YYYY-MM-DD HH:mm")} 〜 ${close.format("YYYY-MM-DD HH:mm")}`);

        if (nowRaw.isBetween(open, close, null, "[)")) {
            isOpen = true;
            nextOpening = `本日 ${close.format("HH:mm")} まで営業`;
            break;
        }
    }

    if (!isOpen) {
        const nextDayKey = Object.keys(hoursMap).find((key) => key.startsWith(tomorrow));
        if (nextDayKey) {
            nextOpening = `次の営業: ${nextDayKey} ${hoursMap[nextDayKey][0]?.open} から`;
        }
    }

    return { isOpen, nextOpening };
};

// ✅ **曜日の変換関数**
const convertToJapaneseDay = (day: string) => {
  return day.replace("Sunday", "日曜日")
            .replace("Monday", "月曜日")
            .replace("Tuesday", "火曜日")
            .replace("Wednesday", "水曜日")
            .replace("Thursday", "木曜日")
            .replace("Friday", "金曜日")
            .replace("Saturday", "土曜日")
            .replace("曜日", "");  // ✅ 曜日を削除
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