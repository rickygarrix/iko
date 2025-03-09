"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilter from "@/components/SearchFilter";

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

export default function SearchResults() {
  return <SearchContent />;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedGenres, setSelectedGenres] = useState<string[]>(searchParams.get("genre")?.split(",") || []);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(searchParams.get("area")?.split(",") || []);
  const [selectedPayments, setSelectedPayments] = useState<string[]>(searchParams.get("payment")?.split(",") || []);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(searchParams.get("open") === "true");

  // 🔹 初回マウント時に検索をトリガー
  useEffect(() => {
    console.log("🚀 handleSearch() を実行します...");
    handleSearch();
  }, []);

  // ✅ `stores` の取得をログに出力
  useEffect(() => {
    console.log("📦 取得した stores:", stores);
  }, [stores]);

  // 🔹 検索を実行する関数
  const handleSearch = async () => {
    setLoading(true);
    let query = supabase.from("stores").select("*");

    if (selectedGenres.length > 0) query = query.in("genre", selectedGenres);
    if (selectedAreas.length > 0) query = query.in("area", selectedAreas);
    if (selectedPayments.length > 0) query = query.overlaps("payment_methods", selectedPayments);

    const { data, error } = await query;
    if (error) {
      console.error("🔥 Supabase Error:", error.message);
      setError(error.message);
      setStores([]);
    } else {
      setStores(showOnlyOpen ? data.filter(store => checkIfOpen(store.opening_hours).isOpen) : data || []);
    }
    setLoading(false);
  };

  // 🔹 検索ボタンの動作
  const handleSearchButtonClick = () => {
    const params = new URLSearchParams();
    if (selectedGenres.length > 0) params.set("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.set("area", selectedAreas.join(","));
    if (selectedPayments.length > 0) params.set("payment", selectedPayments.join(","));
    if (showOnlyOpen) params.set("open", "true");

    router.push(`/search?${params.toString()}`);
    handleSearch(); // 🔥 検索を実行
  };

  const checkIfOpen = (opening_hours: string) => {
    const now = dayjs();
    const today = now.locale("ja").format("dddd"); // 日本語表記の曜日に統一
    const tomorrow = now.add(1, "day").locale("ja").format("dddd"); // 翌日の曜日

    if (!opening_hours) {
        console.error("❌ `opening_hours` が取得できませんでした！");
        return { isOpen: false, nextOpening: "情報なし" };
    }

    const todayHours = opening_hours
        .split("\n") // 改行で曜日ごとに分割
        .find((line) => line.includes(today)) || "情報なし";

    console.log(`📌 現在の曜日: ${today}`);
    console.log(`🔍 取得した営業時間: ${todayHours}`);

    if (!todayHours || todayHours.includes("情報なし")) {
        return { isOpen: false, nextOpening: "情報なし" };
    }

    if (todayHours.includes("休み")) {
        return { isOpen: false, nextOpening: "本日休業" };
    }

    // ✅ 改善: 曜日を削除して時間のみ取得
    const timeRanges = todayHours.split(" ").slice(1).join(" ").trim().split(", ");

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

        console.log(`🕒 営業時間: ${open.format("YYYY-MM-DD HH:mm")} 〜 ${close.format("YYYY-MM-DD HH:mm")}`);

        if (now.isBetween(open, close, null, "[)")) {
            return { isOpen: true, nextOpening: `本日 ${close.format("HH:mm")} まで営業` };
        }
    }

    const nextDayHours = opening_hours
        .split("\n")
        .find((line) => line.includes(tomorrow));

    if (nextDayHours) {
        const nextOpenTime = nextDayHours.split(" ").slice(1).join(" ").trim().split(", ")[0].split("〜")[0].trim();
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
        handleSearch={handleSearchButtonClick} // ✅ 検索ボタンを押した時に実行
      />

      {loading ? (
        <p className="mt-6">ロード中...</p>
      ) : stores.length === 0 ? (
        <p className="text-gray-400 mt-6">該当する店舗がありません。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {stores.map((store) => {
  // ✅ ここで checkIfOpen() の戻り値を取得
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
            <div>
              <h2 className="text-xl font-semibold">{store.name}</h2>
              <p className="text-gray-400">🎵{store.genre}</p>
              <p className="text-gray-400">👥 {store.capacity}人</p>
              <p className="text-gray-300">📍: {store.area}</p>
              <p className="text-gray-300">💰: {store.payment_methods?.join(", ") || "情報なし"}</p>
            </div>
            <div>
              {/* ✅ isOpen を適切に適用 */}
              <p className={isOpen ? "text-green-400" : "text-red-400"}>
                🕗 {isOpen ? "営業中" : "営業時間外"}
              </p>
              <p className="text-white">{nextOpening}</p>
            </div>
          </div>
        </div>
      </Link>
    );
  })}
        </div>
      )}
    </div>
  );
}