"use client";

import { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useRouter } from "next/navigation";
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
  height: "100vh",
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
                onClick={() => setActiveStoreId(store.id)}
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

        {isFilterOpen && (
          <div className="fixed inset-0 bg-black/40 z-[9999] flex justify-center items-start pt-12 px-4">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-4">
              <SearchFilters
                showOnlyOpen={showOnlyOpen}
                selectedGenres={selectedGenres}
                onToggleOpen={handleToggleOpen}
                onToggleGenre={handleToggleGenre}
              />
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-sm text-gray-600 underline"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 現在地へ戻るボタン */}
        <button
          onClick={handleRecenter}
          className="fixed bottom-[260px] right-4 z-50 bg-white text-sm px-4 py-2 rounded-full shadow-md border border-gray-300"
        >
          現在地へ戻る
        </button>

        {/* 条件検索 */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="fixed bottom-[200px] right-4 z-50 bg-white text-sm px-4 py-2 rounded-full shadow-md border border-gray-300"
        >
          条件検索
        </button>

        {activeStoreId && (
          <div
            id="cardSlider"
            className="absolute bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-16 overflow-x-auto flex gap-6 snap-x snap-mandatory"
          >
            {filteredStores.map((store, index) => (
              <div
                key={store.id}
                data-id={store.id}
                ref={(el: HTMLDivElement | null) => {
                  cardRefs.current[index] = el;
                }}
                className={`min-w-[85%] max-w-[85%] bg-white border rounded-lg p-4 cursor-pointer snap-center shadow-md transition-transform ${store.id === activeStoreId ? "border-blue-500 scale-105" : ""
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
                          <br />
                          {status.nextOpening
                            ? `次回営業: ${convertToJapaneseDay(status.nextOpening.day)} ${status.nextOpening.time}〜`
                            : "次回営業情報なし"}
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
