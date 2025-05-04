"use client";

import { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import SearchFilters from "@/components/SearchFilters";
import Header from "@/components/Header";
import { checkIfOpen, getTodayHoursText, convertToJapaneseDay } from "@/lib/utils";
import type { Store } from "@/types/store";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/types/messages";
import dayjs from "dayjs";
import "dayjs/locale/ja";

dayjs.locale("ja");

const containerStyle = {
  width: "100vw",
  height: "calc(100vh - 48px)",
};

type Props = {
  locale: Locale;
  messages: Messages;
};



export function MapPageWithLayout({ locale, messages }: Props) {
  const router = useRouter();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 35.681236, lng: 139.767125 });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [genreTranslations, setGenreTranslations] = useState<Record<string, string>>({});

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setMapCenter(position);
          setUserLocation(position);
        },
        () => setMapCenter({ lat: 35.681236, lng: 139.767125 })
      );
    }
  }, []);
  useEffect(() => {
    const fetchGenreTranslations = async () => {
      const { data, error } = await supabase
        .from("genre_translations")
        .select("genre_id, name")
        .eq("locale", "ja"); // ← ここを固定に

      if (error) {
        console.error("ジャンル翻訳の取得エラー:", error);
        return;
      }

      const map: Record<string, string> = {};
      data?.forEach((item) => {
        map[item.genre_id] = item.name;
      });

      setGenreTranslations(map);
      console.log("取得されたジャンル翻訳:", map);
    };

    fetchGenreTranslations();
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase.from("stores").select("*").eq("is_published", true);
      if (data) setStores(data);
    };
    fetchStores();
  }, []);

  useEffect(() => {
    const filtered = stores.filter((store) => {
      const genreMatch =
        selectedGenres.length === 0 || selectedGenres.some((g) => store.genre_ids?.includes(g));
      const isOpen = store.opening_hours ? checkIfOpen(store.opening_hours).isOpen : false;
      const isOpenMatch = !showOnlyOpen || isOpen;
      return genreMatch && isOpenMatch && store.latitude && store.longitude;
    });
    setFilteredStores(filtered);
  }, [stores, selectedGenres, showOnlyOpen]);

  const handleToggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleToggleOpen = () => setShowOnlyOpen((prev) => !prev);

  const handleRecenter = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
    }
  };

  const todayLabel = dayjs().format("dddd");

  useEffect(() => {
    if (!activeStoreId || !mapRef.current) return;
    const target = filteredStores.find((s) => s.id === activeStoreId);
    if (target) {
      mapRef.current.panTo({ lat: target.latitude!, lng: target.longitude! });
    }
  }, [activeStoreId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            if (id) setActiveStoreId(id);
          }
        });
      },
      {
        root: document.querySelector("#cardSlider"),
        threshold: 0.6,
      }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [filteredStores]);

  return (
    <>
      <Header locale={locale} messages={messages.header} />

      <div className="pt-[48px] relative min-h-screen">
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ ...containerStyle, zIndex: 0 }}
            center={mapCenter}
            zoom={13}
            options={{
              fullscreenControl: false,
              mapTypeControl: false,
              streetViewControl: false,
              zoomControl: false,
              scaleControl: false,
              gestureHandling: "greedy",
            }}
            onLoad={(map) => {
              mapRef.current = map;
            }}
          >
            {filteredStores.map((store) => (
              <Marker
                key={store.id}
                position={{ lat: store.latitude!, lng: store.longitude! }}
                label={{ text: store.name, fontSize: "12px", color: "#000", fontWeight: "bold" }}
                onClick={() => {
                  setActiveStoreId(store.id);
                  const targetIndex = filteredStores.findIndex((s) => s.id === store.id);
                  const targetEl = cardRefs.current[targetIndex];
                  if (targetEl) {
                    targetEl.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
                  }
                }}
                icon={{
                  url: "/map-pin.png",
                  scaledSize: new window.google.maps.Size(
                    activeStoreId === store.id ? 60 : 40,
                    activeStoreId === store.id ? 60 : 40
                  ),
                  labelOrigin: new window.google.maps.Point(20, -10),
                }}
              />
            ))}

            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#4285F4",
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "#fff",
                }}
              />
            )}
          </GoogleMap>
        )}


        {/* 現在地へ戻るボタン */}
        <button
          onClick={handleRecenter}
          className="fixed bottom-[200px] right-4 z-50 w-12 h-12 bg-white rounded-full shadow-md border border-gray-300 flex items-center justify-center"
        >
          <Image src="/map/location.svg" alt="現在地" width={20} height={20} />
        </button>

        {/* 検索・営業中フィルター UI（ヘッダー下） */}
        <div className="absolute top-[60px] left-4 z-50 flex items-center gap-2">
          {/* 検索アイコン（ジャンルパネルトグル） */}
          <button
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="w-10 h-10 rounded-full border border-gray-300 shadow flex items-center justify-center bg-white"
            style={{
              border: "none",           // ✅ 不要なボーダーを削除
              outline: "none",          // ✅ フォーカス時の枠も消す
              boxShadow: "none",        // ✅ 影も無効化
            }}
          >
            <Image src="/map/search.svg" alt="検索" width={20} height={20} />
          </button>

          {/* 営業中チェック */}
          <label className="text-sm flex items-center gap-1 bg-white px-2 py-1 rounded shadow border">
            <input type="checkbox" checked={showOnlyOpen} onChange={handleToggleOpen} />
            営業中
          </label>
        </div>

        {/* 検索条件パネル */}
        {isFilterOpen && (
          <div className="absolute top-[110px] left-[20px] z-50">
            <SearchFilters
              showOnlyOpen={showOnlyOpen}
              selectedGenres={selectedGenres}
              onToggleOpen={handleToggleOpen}
              onToggleGenre={handleToggleGenre}
            />
          </div>
        )}

        {activeStoreId && (
          <div
            id="cardSlider"
            className="absolute bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-4 overflow-x-auto flex gap-4 snap-x snap-mandatory"
          >
            {filteredStores.map((store, index) => (
              <div
                key={store.id}
                data-id={store.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`w-[260px] sm:w-[300px] md:w-[320px] lg:w-[360px] flex-shrink-0 bg-white border rounded-lg p-4 cursor-pointer snap-center shadow-md transition-transform ${store.id === activeStoreId ? "border-blue-500 scale-105" : ""
                  }`}
                onClick={() => router.push(`/stores/${store.id}`)}
              >
                <h3 className="text-[16px] font-semibold text-[#1F1F21] mb-1">{store.name}</h3>
                <p className="text-[12px] font-light text-[#1F1F21] leading-[150%] mb-2 line-clamp-3">
                  {store.description || "店舗紹介文はまだありません。"}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  {store.genre_ids && store.genre_ids.length > 0
                    ? store.genre_ids.map((id) => genreTranslations[id] || id).join(" / ")
                    : "ジャンル不明"}
                </p>
                <p className="text-sm text-black">
                  {(() => {
                    const status = checkIfOpen(store.opening_hours || "");

                    if (status.isOpen) {
                      return (
                        <>
                          <span className="text-green-600 font-semibold">営業中</span>
                          <br />
                          {status.closeTime && `${status.closeTime} まで営業`}
                        </>
                      );
                    } else {
                      return (
                        <>
                          <span className="text-red-600 font-semibold">営業時間外</span>
                        </>
                      );
                    }
                  })()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </>
  );
}
