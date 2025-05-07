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
import { checkIfOpen } from "@/lib/utils";
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

const DEFAULT_CENTER = { lat: 35.681236, lng: 139.767125 };


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
  const clickTimestamps = useRef<Record<string, number>>({});
  const hasRestoredFromSessionRef = useRef(false);
  const [hasInitialized, setHasInitialized] = useState(false); // 初期化完了フラグ

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  // sessionStorage から復元
  useEffect(() => {
    const savedCenter = sessionStorage.getItem("mapCenter");
    const savedZoom = sessionStorage.getItem("mapZoom");
    const savedActiveId = sessionStorage.getItem("activeStoreId");
    const savedScrollLeft = sessionStorage.getItem("cardScrollLeft");

    if (savedCenter && savedZoom && savedActiveId) {
      try {
        const parsed = JSON.parse(savedCenter);
        setMapCenter(parsed);
        hasRestoredFromSessionRef.current = true;
        if (savedZoom) {
          setTimeout(() => mapRef.current?.setZoom(Number(savedZoom)), 500);
        }
        if (savedActiveId) setActiveStoreId(savedActiveId);
        if (savedScrollLeft) {
          setTimeout(() => {
            const el = document.getElementById("cardSlider");
            if (el) el.scrollLeft = parseInt(savedScrollLeft, 10);
          }, 500);
        }
      } catch {
        // セッション破損などの安全処理
        sessionStorage.clear();
      }
    } else {
      // ブラウザバックでない ⇒ 現在地取得
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(position);
            setMapCenter(position);
            sessionStorage.setItem("userLocation", JSON.stringify(position)); // 🔸追加
          },
          () => {
            setMapCenter(DEFAULT_CENTER);
          }
        );
      }
    }
  }, []);

  useEffect(() => {
    const savedLocation = sessionStorage.getItem("userLocation");
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setUserLocation(parsed);
      } catch {
        sessionStorage.removeItem("userLocation");
      }
    }
  }, []);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(13); // 好きな初期ズームに調整
    }
  }, [userLocation]);

  useEffect(() => {
    if (!hasRestoredFromSessionRef.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(position);
          setMapCenter(position); // ✅ 初期中心は現在地
          setHasInitialized(true); // ✅ 初期化完了フラグを立てる
        },
        () => {
          setMapCenter(DEFAULT_CENTER);
          setHasInitialized(true); // ✅ 失敗時も初期化フラグを立てる
        }
      );
    }
  }, []);

  useEffect(() => {
    supabase
      .from("genre_translations")
      .select("genre_id, name")
      .eq("locale", "ja")
      .then(({ data, error }) => {
        if (error) return;
        const map: Record<string, string> = {};
        data?.forEach((item) => (map[item.genre_id] = item.name));
        setGenreTranslations(map);
      });
  }, []);

  useEffect(() => {
    if (hasInitialized && userLocation && filteredStores.length > 0 && !activeStoreId) {
      const closest = filteredStores.reduce((prev, curr) => {
        const prevDist = Math.hypot(prev.latitude! - userLocation.lat, prev.longitude! - userLocation.lng);
        const currDist = Math.hypot(curr.latitude! - userLocation.lat, curr.longitude! - userLocation.lng);
        return currDist < prevDist ? curr : prev;
      });
      setActiveStoreId(closest.id);
      const index = filteredStores.findIndex((s) => s.id === closest.id);
      cardRefs.current[index]?.scrollIntoView({ behavior: "smooth", inline: "start" });
    }
  }, [hasInitialized, userLocation, filteredStores]);

  useEffect(() => {
    supabase
      .from("stores")
      .select("*")
      .eq("is_published", true)
      .then(({ data }) => {
        if (data) setStores(data);
      });
  }, []);

  useEffect(() => {
    const filtered = stores.filter((store) => {
      const genreMatch = selectedGenres.length === 0 || selectedGenres.some((g) => store.genre_ids?.includes(g));
      const isOpen = store.opening_hours ? checkIfOpen(store.opening_hours).isOpen : false;
      const isOpenMatch = !showOnlyOpen || isOpen;
      return genreMatch && isOpenMatch && store.latitude && store.longitude;
    });
    setFilteredStores(filtered);
  }, [stores, selectedGenres, showOnlyOpen]);

  useEffect(() => {
    if (userLocation && filteredStores.length > 0 && !activeStoreId) {
      const closest = filteredStores.reduce((prev, curr) => {
        const prevDist = Math.hypot(prev.latitude! - userLocation.lat, prev.longitude! - userLocation.lng);
        const currDist = Math.hypot(curr.latitude! - userLocation.lat, curr.longitude! - userLocation.lng);
        return currDist < prevDist ? curr : prev;
      });
      setActiveStoreId(closest.id);
      const index = filteredStores.findIndex((s) => s.id === closest.id);
      cardRefs.current[index]?.scrollIntoView({ behavior: "smooth", inline: "start" });
    }
  }, [userLocation, filteredStores]);

  const handleToggleGenre = (genre: string) => {
    setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]));
  };

  const handleToggleOpen = () => setShowOnlyOpen((prev) => !prev);

  const handleRecenter = () => {
    if (!userLocation) {
      alert("現在地が取得できていません");
      return;
    }
    if (mapRef.current) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(13);
    }
  };
  const handleClickStore = (store: Store, index: number) => {
    const now = Date.now();
    const last = clickTimestamps.current[store.id] || 0;
    const diff = now - last;
    setActiveStoreId(store.id);
    mapRef.current?.panTo({ lat: store.latitude!, lng: store.longitude! });
    mapRef.current?.setZoom(16);
    cardRefs.current[index]?.scrollIntoView({ behavior: "smooth", inline: "start" });
    if (diff < 1000) {
      sessionStorage.setItem("mapCenter", JSON.stringify(mapRef.current?.getCenter()?.toJSON()));
      sessionStorage.setItem("mapZoom", mapRef.current?.getZoom()?.toString() || "13");
      sessionStorage.setItem("activeStoreId", store.id);
      sessionStorage.setItem("cardScrollLeft", document.getElementById("cardSlider")?.scrollLeft?.toString() || "0");
      router.push(`/stores/${store.id}`);
    } else {
      clickTimestamps.current[store.id] = now;
    }
  };

  return (
    <>
      <Header locale={locale} messages={messages.header} />
      <div className="pt-[48px] relative min-h-screen">
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={13}
            options={{ gestureHandling: "greedy", zoomControl: false }}
            onLoad={(map) => {
              mapRef.current = map;
            }}
          >
            {filteredStores.map((store, index) => (
              <Marker
                key={store.id}
                position={{ lat: store.latitude!, lng: store.longitude! }}
                label={{ text: store.name, fontSize: "12px", fontWeight: "bold", color: "#000" }}
                icon={{
                  url: "/map-pin.png",
                  scaledSize: new google.maps.Size(activeStoreId === store.id ? 60 : 40, activeStoreId === store.id ? 60 : 40),
                }}
                onClick={() => handleClickStore(store, index)}
              />
            ))}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#4285F4", fillOpacity: 1, strokeWeight: 2, strokeColor: "#fff" }}
              />
            )}
          </GoogleMap>
        )}

        {/* UIコンポーネント */}
        <button onClick={handleRecenter} className="fixed bottom-[200px] right-4 z-50 w-12 h-12 bg-white rounded-full shadow-md border border-gray-300 flex items-center justify-center">
          <Image src="/map/location.svg" alt="現在地" width={20} height={20} />
        </button>

        <div className="absolute top-[60px] left-4 z-50 flex items-center gap-2">
          <button onClick={() => setIsFilterOpen((prev) => !prev)} className="w-10 h-10 rounded-full shadow flex items-center justify-center bg-white">
            <Image src="/map/search.svg" alt="検索" width={20} height={20} />
          </button>
          <label className="text-sm flex items-center gap-1 bg-white px-2 py-1 rounded shadow border">
            <input type="checkbox" checked={showOnlyOpen} onChange={handleToggleOpen} />
            営業中
          </label>
        </div>

        {isFilterOpen && (
          <div className="absolute top-[110px] left-[20px] z-50">
            <SearchFilters showOnlyOpen={showOnlyOpen} selectedGenres={selectedGenres} onToggleOpen={handleToggleOpen} onToggleGenre={handleToggleGenre} />
          </div>
        )}

        {/* 店舗カード */}
        {activeStoreId && (
          <div id="cardSlider" className="absolute bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-4 overflow-x-auto flex gap-4 snap-x snap-mandatory">
            {filteredStores.map((store, index) => (
              <div
                key={store.id}
                data-id={store.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`w-[260px] sm:w-[300px] md:w-[320px] lg:w-[360px] flex-shrink-0 bg-white border rounded-lg p-4 cursor-pointer snap-center shadow-md transition-transform ${store.id === activeStoreId ? "border-blue-500 scale-105" : ""}`}
                onClick={() => handleClickStore(store, index)}
              >
                <h3 className="text-[16px] font-semibold text-[#1F1F21] mb-1">{store.name}</h3>
                <p className="text-[12px] font-light text-[#1F1F21] leading-[150%] mb-2 line-clamp-3">
                  {store.description || "店舗紹介文はまだありません。"}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  {store.genre_ids?.map((id) => genreTranslations[id] || id).join(" / ") || "ジャンル不明"}
                </p>
                <p className="text-sm text-black">
                  {(() => {
                    const status = checkIfOpen(store.opening_hours || "");
                    if (status.isOpen) {
                      return <><span className="text-green-600 font-semibold">営業中</span><br />{status.closeTime && `${status.closeTime} まで営業`}</>;
                    } else {
                      return <><span className="text-red-600 font-semibold">営業時間外</span><br />{status.nextOpening && `次の営業：${status.nextOpening.day} ${status.nextOpening.time} から`}</>;
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
