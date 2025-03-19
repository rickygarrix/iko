
"use client";

import { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker, Circle } from "@react-google-maps/api";
import { supabase } from "@/lib/supabase";
import { parseOpeningHours } from "@/lib/parseOpeningHours";
import { useRouter, useSearchParams } from "next/navigation";

const containerStyle = {
  width: "100%",
  height: "85vh",
};

const SEARCH_RADIUS = 2;
const GENRES = ["Jazz", "House", "Techno", "EDM"];

type Store = {
  id: string;
  name: string;
  genre: string;
  area: string;
  lat: number;
  lng: number;
  image_url?: string;
  opening_hours?: string;
  isOpen: boolean;
  displayText: string;
  nextOpening: string;
};
// 2点間の距離を計算する関数（ハーバーサインの公式を使用）
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // 地球の半径（km）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};
export default function MapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParams = searchParams.toString(); // 🔹 地図のフィルター情報を保持
  const [locations, setLocations] = useState<Store[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 35.6895, lng: 139.6917 });
  const [showSearchButton, setShowSearchButton] = useState(true);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const handleReturnToCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.panTo(currentLocation);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setMapCenter({ lat: latitude, lng: longitude });
        },
        (error) => console.error("📍 現在地取得エラー:", error)
      );
    }

    const handleFullscreenChange = () => {
      setShowSearchButton(true);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const fetchNearbyStores = async (lat: number, lng: number, filterOpen: boolean, genres: string[]) => {
    if (!lat || !lng) return;

    const { data, error } = await supabase
      .from("stores")
      .select("id, name, latitude, longitude, genre, area, image_url, opening_hours");

    if (error) {
      console.error("🔥 Supabase Error:", error.message);
      return;
    }

    if (data) {
      const filteredData: Store[] = data
        .map((store) => {
          const { isOpen, displayText, nextOpening } = parseOpeningHours(store.opening_hours);
          return {
            id: store.id,
            name: store.name,
            lat: Number(store.latitude),
            lng: Number(store.longitude),
            genre: store.genre,
            area: store.area,
            image_url: store.image_url || "/default-image.jpg",
            opening_hours: store.opening_hours || "営業時間情報なし",
            isOpen: isOpen ?? false,
            displayText: displayText,
            nextOpening: nextOpening ?? "次の営業情報なし"
          };
        })
        .filter((store) => {
          const withinDistance = getDistanceFromLatLonInKm(lat, lng, store.lat, store.lng) <= SEARCH_RADIUS;
          const matchesOpen = filterOpen ? store.isOpen : true;
          const matchesGenre = genres.length > 0 ? genres.includes(store.genre) : true;
          return withinDistance && matchesOpen && matchesGenre;
        });

      setLocations(filteredData);
    }
  };

  const handleSearchInThisArea = () => {
    fetchNearbyStores(mapCenter.lat, mapCenter.lng, showOnlyOpen, selectedGenres);
    setShowSearchButton(false);
    // 🔹 ここで zoom を 14 に変更
    if (mapRef.current) {
      mapRef.current.setZoom(14);
    }
  };

  const handleFilterChange = () => {
    setShowOnlyOpen((prev) => !prev);
    fetchNearbyStores(mapCenter.lat, mapCenter.lng, !showOnlyOpen, selectedGenres);
  };

  const handleGenreChange = (genre: string) => {
    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    setSelectedGenres(newGenres);
    fetchNearbyStores(mapCenter.lat, mapCenter.lng, showOnlyOpen, newGenres);
  };

  return (
    <div style={{ position: "relative" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={13}
        options={{
          gestureHandling: "greedy",
          fullscreenControl: false, // フルスクリーンボタンを無効化
          disableDefaultUI: true, // すべてのデフォルトUIを非表示
          mapTypeControl: false, // 地図の種類変更ボタンを無効化
          streetViewControl: false, // ストリートビュー（ペグマン）を無効化
          zoomControl: false, // ズームコントロールは有効化
        }}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        onDragEnd={() => {
          if (mapRef.current) {
            const newCenter = mapRef.current.getCenter();
            if (newCenter) {
              setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
              setShowSearchButton(true);
            }
          }
        }}
        onZoomChanged={() => {
          if (mapRef.current) {
            setShowSearchButton(true);
          }
        }}
      >
        {currentLocation && (
          <Circle center={currentLocation} radius={50} options={{ strokeColor: "#007bff", fillColor: "#007bff", fillOpacity: 0.35 }} />
        )}

        {locations.map((location) => (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            label={{ text: location.name, color: "black", fontSize: "12px", fontWeight: "bold" }}
            onClick={() => setSelectedStore(location)}
          />
        ))}
      </GoogleMap>

      {/* ✅ 営業中・ジャンルフィルター（常に表示） */}
      <div style={{ position: "absolute", top: 20, left: 20, backgroundColor: "#FFA500", padding: "10px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
        <label><input type="checkbox" checked={showOnlyOpen} onChange={handleFilterChange} /> 営業中</label>
        {GENRES.map((genre) => (
          <label key={genre}><input type="checkbox" checked={selectedGenres.includes(genre)} onChange={() => handleGenreChange(genre)} /> {genre}</label>
        ))}
      </div>

      {/* ✅ ここで検索するボタン（地図移動時に表示） */}
      {showSearchButton && (
        <div style={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#FFA500",
          padding: "10px",
          borderRadius: "10px",
          zIndex: 1000
        }}>
          <button onClick={handleSearchInThisArea}>🔍 このエリアで検索する</button>
        </div>
      )}

      {/* ✅ 店舗情報の表示 */}
      {selectedStore && (
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", backgroundColor: "white", padding: "16px", textAlign: "center", color: "black", fontSize: "16px", cursor: "pointer" }} onClick={() => router.push(`/stores/${selectedStore.id}?prev=/map&${queryParams}`)}>
          <h2>{selectedStore.name}</h2>
          <p>🎵 {selectedStore.genre} | 📍 {selectedStore.area}</p>
          <p style={{ fontWeight: "bold", color: selectedStore.isOpen ? "green" : "red" }}>{selectedStore.isOpen ? "営業中" : "営業時間外"}</p>
          <p>{selectedStore.isOpen ? selectedStore.displayText : selectedStore.nextOpening}</p>
        </div>
      )}

      {/* ✅ 現在地に戻るボタン */}
      <button
        onClick={handleReturnToCurrentLocation}
        style={{
          position: "absolute",
          bottom: "140px",
          right: "20px",
          backgroundColor: "#FFA500",
          color: "white",
          padding: "10px 15px",
          borderRadius: "50%",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
        }}
        title="現在地に戻る"
      >
        📍
      </button>
    </div>
  );
}
