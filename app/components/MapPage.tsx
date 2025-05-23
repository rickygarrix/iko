"use client";

import { useEffect, useRef, useState } from "react";
import React from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import SearchFilter from "@/components/SearchFilter";
import Header from "@/components/Header";
import { checkIfOpen } from "@/lib/utils";
import type { Store } from "@/types/store";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import SlideDownModal from "@/components/SlideDownModal";
import clsx from "clsx";
import { OverlayView } from "@react-google-maps/api";

dayjs.locale("ja");

const containerStyle = {
  width: "100vw",
  height: "calc(100vh - 48px)",
};

const DEFAULT_CENTER = { lat: 35.681236, lng: 139.767125 };

const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  shibuya: { lat: 35.658034, lng: 139.701636 },
  shinjuku: { lat: 35.690921, lng: 139.700258 },
  roppongi: { lat: 35.662834, lng: 139.731547 },
  ginza: { lat: 35.671732, lng: 139.765172 },
  ikebukuro: { lat: 35.728926, lng: 139.71038 },
  omotesando: { lat: 35.664935, lng: 139.712753 },
  ueno: { lat: 35.713768, lng: 139.777254 },
  yokohama: { lat: 35.466188, lng: 139.622715 },
};

export function MapPageWithLayout() {
  const router = useRouter();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [genreTranslations, setGenreTranslations] = useState<Record<string, string>>({});
  const clickTimestamps = useRef<Record<string, number>>({});
  const hasRestoredFromSessionRef = useRef(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [areaTranslations, setAreaTranslations] = useState<Record<string, string>>({});
  const [paymentTranslations, setPaymentTranslations] = useState<Record<string, string>>({});
  const [tempSelectedGenres, setTempSelectedGenres] = useState<string[]>([]);
  const [tempShowOnlyOpen, setTempShowOnlyOpen] = useState(false);
  const [tempSelectedAreas, setTempSelectedAreas] = useState<string[]>([]);
  const [tempSelectedPayments, setTempSelectedPayments] = useState<string[]>([]);
  const previewCount = stores.filter((store) => {
    const genreMatch = tempSelectedGenres.length === 0 || tempSelectedGenres.some((g) => store.genre_ids?.includes(g));
    const areaMatch = tempSelectedAreas.length === 0 || tempSelectedAreas.includes(store.area_id ?? "");
    const paymentMatch =
      tempSelectedPayments.length === 0 ||
      tempSelectedPayments.some((id) => store.payment_method_ids?.includes(id));
    const isOpen = store.opening_hours ? checkIfOpen(store.opening_hours).isOpen : false;
    const openMatch = !tempShowOnlyOpen || isOpen;
    return genreMatch && areaMatch && paymentMatch && openMatch && store.latitude && store.longitude;
  }).length;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    const savedCenter = sessionStorage.getItem("mapCenter");
    const savedZoom = sessionStorage.getItem("mapZoom");
    const savedActiveId = sessionStorage.getItem("activeStoreId");
    const savedScrollLeft = sessionStorage.getItem("cardScrollLeft");

    if (savedCenter) {
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
        sessionStorage.clear();
      }
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(position);
            setMapCenter(position);
            sessionStorage.setItem("userLocation", JSON.stringify(position));
          },
          () => setMapCenter(DEFAULT_CENTER)
        );
      }
    }
  }, []);

  useEffect(() => {
    if (isFilterOpen) {
      setTempSelectedGenres(selectedGenres);
      setTempSelectedAreas(selectedAreas);
      setTempSelectedPayments(selectedPayments);
      setTempShowOnlyOpen(showOnlyOpen);
    }
  }, [isFilterOpen]);

  useEffect(() => {
    supabase
      .from("area_translations")
      .select("area_id, name")
      .eq("locale", "ja")
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((item) => (map[item.area_id] = item.name));
          setAreaTranslations(map);
        }
      });

    supabase
      .from("payment_method_translations")
      .select("payment_method_id, name")
      .eq("locale", "ja")
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((item) => (map[item.payment_method_id] = item.name));
          setPaymentTranslations(map);
        }
      });
  }, []);

  useEffect(() => {
    const savedLocation = sessionStorage.getItem("userLocation");
    if (savedLocation) {
      try {
        setUserLocation(JSON.parse(savedLocation));
      } catch {
        sessionStorage.removeItem("userLocation");
      }
    }
  }, []);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(13);
    }
  }, [userLocation]);

  useEffect(() => {
    if (!hasRestoredFromSessionRef.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(position);
          setMapCenter(position);
          setHasInitialized(true);
        },
        () => {
          setMapCenter(DEFAULT_CENTER);
          setHasInitialized(true);
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
        if (!error && data) {
          const map: Record<string, string> = {};
          data.forEach((item) => (map[item.genre_id] = item.name));
          setGenreTranslations(map);
        }
      });
  }, []);

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

  const handleToggleGenre = (genre: string) => {
    setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]));
  };

  const handleToggleOpen = () => setShowOnlyOpen((prev) => !prev);

  const handleRecenter = () => {
    if (!userLocation) {
      alert("現在地が取得できていません");
      return;
    }
    mapRef.current?.panTo(userLocation);
    mapRef.current?.setZoom(13);
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
      <Header
        locale="ja"
        messages={{
          search: "検索",
          map: "地図",
        }}
      />
      <div className="pt-[48px] relative h-[100dvh] flex flex-col overflow-hidden">
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
              <React.Fragment key={store.id}>
                <Marker
                  position={{ lat: store.latitude!, lng: store.longitude! }}
                  icon={{
                    url: activeStoreId === store.id ? "/map/selectpin.svg" : "/map/pin.svg",
                    scaledSize: activeStoreId === store.id
                      ? new google.maps.Size(40, 40) // 選択中ピンは小さめ
                      : new google.maps.Size(52, 52), // 通常ピンは少し大きめ
                    anchor: activeStoreId === store.id
                      ? new google.maps.Point(20, 40)
                      : new google.maps.Point(26, 52),
                    labelOrigin: activeStoreId === store.id
                      ? new google.maps.Point(20, 50)
                      : new google.maps.Point(26, 64),
                  }}
                  label={{
                    text: store.name,
                    color: "#000",
                    fontSize: "12px",
                    fontWeight: "bold",
                    className: "map-label",
                  }}
                  onClick={() => handleClickStore(store, index)}
                />
              </React.Fragment>
            ))}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
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

        {/* 検索ボタン */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className={clsx(
            "fixed bottom-[300px] right-4 z-1000 w-[56px] h-[56px] rounded-[16px] bg-white border border-gray-300 shadow-[0_2px_4px_rgba(0,0,0,0.25)] flex items-center justify-center",
            isFilterOpen && "brightness-75 saturate-0 pointer-events-none"
          )}
        >
          <Image src="/header/search.svg" alt="検索" width={24} height={24} />
        </button>

        {/* 現在地ボタン */}
        <button
          onClick={handleRecenter}
          className={clsx(
            "fixed bottom-[230px] right-4 z-1000 w-[56px] h-[56px] rounded-[16px] bg-white border border-gray-300 shadow-[0_2px_4px_rgba(0,0,0,0.25)] flex items-center justify-center",
            isFilterOpen && "brightness-75 saturate-0 pointer-events-none"
          )}
        >
          <Image src="/map/location.svg" alt="現在地" width={24} height={24} />
        </button>


        <SlideDownModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
          <SearchFilter
            selectedGenres={tempSelectedGenres}
            setSelectedGenres={setTempSelectedGenres}
            selectedAreas={tempSelectedAreas}
            setSelectedAreas={setTempSelectedAreas}
            selectedPayments={tempSelectedPayments}
            setSelectedPayments={setTempSelectedPayments}
            showOnlyOpen={tempShowOnlyOpen}
            setShowOnlyOpen={setTempShowOnlyOpen}
            handleSearch={() => {
              setSelectedGenres(tempSelectedGenres);
              setSelectedAreas(tempSelectedAreas);
              setSelectedPayments(tempSelectedPayments);
              setShowOnlyOpen(tempShowOnlyOpen);

              // 🎯 検索結果フィルタリング
              const filtered = stores.filter((store) => {
                const genreMatch =
                  tempSelectedGenres.length === 0 ||
                  tempSelectedGenres.some((g) => store.genre_ids?.includes(g));
                const areaMatch =
                  tempSelectedAreas.length === 0 || tempSelectedAreas.includes(store.area_id ?? "");
                const paymentMatch =
                  tempSelectedPayments.length === 0 ||
                  tempSelectedPayments.some((id) => store.payment_method_ids?.includes(id));
                const isOpen = store.opening_hours
                  ? checkIfOpen(store.opening_hours).isOpen
                  : false;
                const openMatch = !tempShowOnlyOpen || isOpen;
                return genreMatch && areaMatch && paymentMatch && openMatch;
              });

              setFilteredStores(filtered);

              // 📍 中心とズームを調整
              if (mapRef.current) {
                if (tempSelectedAreas.length === 1) {
                  // ⭐ エリアが1つだけのときはその駅に寄る
                  const coord = AREA_COORDS[tempSelectedAreas[0]];
                  if (coord) {
                    setMapCenter(coord);
                    mapRef.current.panTo(coord);
                    mapRef.current.setZoom(15);
                  }
                } else if (filtered.length > 0) {
                  // ⭐ 複数 or 全体対象時は該当店舗の範囲にズームアウト
                  const bounds = new window.google.maps.LatLngBounds();
                  filtered.forEach((store) => {
                    if (store.latitude && store.longitude) {
                      bounds.extend(new window.google.maps.LatLng(store.latitude, store.longitude));
                    }
                  });
                  mapRef.current.fitBounds(bounds);
                }
              }

              setIsFilterOpen(false);
            }}
            previewCount={previewCount}
            messages={{
              title: "条件で探す",
              search: "検索",
              reset: "リセット",
              items: "件",
              open: "営業時間",
              open_all: "営業時間外含む",
              open_now: "営業中のみ",
              genre: "ジャンル",
              area: "エリア",
              payment: "支払い方法",
              genres: genreTranslations,
              areas: {},
              payments: {},
            }}
          />
        </SlideDownModal>

        {/* 店舗カード */}
        {activeStoreId && (
          <div
            id="cardSlider"
            className={clsx(
              "absolute bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-4 overflow-x-auto flex gap-4 snap-x snap-mandatory transition-all duration-300",
              isFilterOpen && "brightness-[.7] saturate-50 pointer-events-none"
            )}
          >
            {filteredStores.map((store, index) => (
              <div
                key={store.id}
                data-id={store.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`w-[260px] sm:w-[300px] md:w-[320px] lg:w-[360px] flex-shrink-0 bg-white border rounded-lg p-4 cursor-pointer snap-center shadow-md transition-transform ${store.id === activeStoreId ? "scale-105" : ""
                  }`}
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
                          {status.nextOpening && `次の営業：${status.nextOpening.day} ${status.nextOpening.time} から`}
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