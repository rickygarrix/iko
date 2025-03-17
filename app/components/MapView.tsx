"use client";

import { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker, Circle } from "@react-google-maps/api";
import { supabase } from "@/lib/supabase";
import { parseOpeningHours } from "@/lib/parseOpeningHours";
import { useRouter } from "next/navigation"; // ✅ 追加

const containerStyle = {
  width: "100%",
  height: "80vh",
};

const SEARCH_RADIUS = 5; // 5km

export default function MapView() {
  const router = useRouter();
  const [locations, setLocations] = useState<
    { id: string; lat: number; lng: number; name: string; genre: string; area: string; image_url?: string; opening_hours?: string; isOpen: boolean; displayText: string }[]
  >([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 35.6895, lng: 139.6917 });
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<
    { id: string; name: string; genre: string; area: string; image_url?: string; opening_hours?: string; isOpen: boolean; displayText: string } | null
  >(null);
  const mapRef = useRef<google.maps.Map | null>(null);

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
  }, []);

  const fetchNearbyStores = async (lat: number, lng: number, filterOpen: boolean) => {
    if (!lat || !lng) return;

    const { data, error } = await supabase
      .from("stores")
      .select("id, name, latitude, longitude, genre, area, image_url, opening_hours");

    if (error) {
      console.error("🔥 Supabase Error:", error.message);
      return;
    }

    if (data) {
      const filteredData = data
        .map((store) => {
          const { isOpen, displayText } = parseOpeningHours(store.opening_hours);
          return {
            id: store.id,
            name: store.name,
            lat: Number(store.latitude),
            lng: Number(store.longitude),
            genre: store.genre,
            area: store.area,
            image_url: store.image_url || "/default-image.jpg",
            opening_hours: store.opening_hours || "営業時間情報なし",
            isOpen,
            displayText,
          };
        })
        .filter((store) => {
          const withinDistance = getDistanceFromLatLonInKm(lat, lng, store.lat, store.lng) <= SEARCH_RADIUS;
          return filterOpen ? withinDistance && store.isOpen : withinDistance;
        });

      setLocations(filteredData);
    }
  };

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const handleFilterChange = () => {
    const newFilter = !showOnlyOpen;
    setShowOnlyOpen(newFilter);
    fetchNearbyStores(mapCenter.lat, mapCenter.lng, newFilter);
    setShowSearchButton(false);
  };

  const handleSearchInThisArea = () => {
    fetchNearbyStores(mapCenter.lat, mapCenter.lng, showOnlyOpen);
    setShowSearchButton(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={14}
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
      >
        {currentLocation && (
          <Circle
            center={currentLocation}
            radius={50}
            options={{
              strokeColor: "#007bff",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#007bff",
              fillOpacity: 0.35,
            }}
          />
        )}

        {locations.map((location) => (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            label={{
              text: location.name,
              color: "black",
              fontSize: "12px",
              fontWeight: "bold",
            }}
            onClick={() => setSelectedStore(location)}
          />
        ))}
      </GoogleMap>

      {showSearchButton && (
        <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#FFA500", padding: "10px", borderRadius: "10px" }}>
          <button onClick={handleSearchInThisArea} className="bg-orange-500 text-white p-2 rounded shadow-lg">
            🔍 ここで検索する
          </button>
          <label style={{ display: "flex", alignItems: "center", color: "white" }}>
            <input type="checkbox" checked={showOnlyOpen} onChange={handleFilterChange} style={{ marginRight: "5px" }} />
            営業中のみ表示
          </label>
        </div>
      )}

      {/* ✅ 店舗情報の表示 */}
      {selectedStore && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            backgroundColor: "white",
            padding: "16px",
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
            boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            color: "black",
            fontSize: "16px",
            cursor: "pointer",
          }}
          onClick={() => router.push(`/stores/${selectedStore.id}`)} // ✅ クリックで詳細ページへ遷移
        >
          <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>{selectedStore.name}</h2>
          <p>🎵 ジャンル: {selectedStore.genre}</p>
          <p>📍 エリア: {selectedStore.area}</p>
          <p style={{ fontWeight: "bold", color: selectedStore.isOpen ? "green" : "red" }}>
            {selectedStore.isOpen ? "営業中" : "営業時間外"}
          </p>
          <p>⏰ 本日の営業時間: {selectedStore?.displayText || "営業時間情報なし"}</p>
        </div>
      )}
    </div>
  );
}