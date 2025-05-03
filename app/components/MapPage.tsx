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
import { checkIfOpen, getTodayHoursText } from "@/lib/utils";
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
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={13}
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

        <button
          onClick={handleRecenter}
          className="absolute bottom-4 right-4 z-50 bg-white text-sm px-4 py-2 rounded-full shadow-md border border-gray-300"
        >
          現在地へ戻る
        </button>

        <button
          onClick={() => setIsFilterOpen(true)}
          className="absolute top-4 right-4 z-50 bg-white text-sm px-4 py-2 rounded-full shadow-md border border-gray-300"
        >
          条件検索
        </button>

        {activeStoreId && (
          <div
            id="cardSlider"
            className="absolute bottom-0 left-0 right-0 z-40 bg-white shadow-lg px-4 pb-6 pt-3 overflow-x-auto flex gap-4 snap-x snap-mandatory"
          >
            {filteredStores.map((store, index) => (
              <div
                key={store.id}
                data-id={store.id}
                ref={(el: HTMLDivElement | null) => {
                  cardRefs.current[index] = el;
                }}
                className={`min-w-[360px] max-w-[360px] bg-white border rounded-lg p-4 cursor-pointer snap-center shadow-md transition-transform ${store.id === activeStoreId ? "border-blue-500 scale-105" : ""
                  }`}
                onClick={() => router.push(`/stores/${store.id}`)}
              >
                <h3 className="font-bold text-lg mb-1">{store.name}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  {todayLabel}の営業時間: {getTodayHoursText(store.opening_hours || "")}
                </p>
                <p className="text-sm text-gray-700">
                  {store.genre_ids?.join(" / ") || "ジャンル不明"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </>
  );
}
