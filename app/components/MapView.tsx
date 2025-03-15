"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation"; // ✅ 追加
import { GoogleMap, Marker, useJsApiLoader, Circle } from "@react-google-maps/api";
import { supabase } from "@/lib/supabase";
import { checkIfOpen } from "@/lib/utils";

const containerStyle = {
  width: "100%",
  height: "80vh",
};

export default function MapView() {
  const router = useRouter(); // ✅ 追加

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [locations, setLocations] = useState<
    { id: string; lat: number; lng: number; name: string; area: string; genre: string; isOpen: boolean }[]
  >([]);
  const [selectedStore, setSelectedStore] = useState<
    { id: string; name: string; area: string; genre: string; isOpen: boolean } | null
  >(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCenter = { lat: latitude, lng: longitude };

          console.log("📍 現在地取得:", newCenter);

          setCurrentLocation(newCenter);
          setMapCenter(newCenter);

          // ✅ 現在地が取得できたら店舗を検索
          fetchNearbyStores(latitude, longitude);
        },
        (error) => console.error("📍 現在地取得エラー:", error)
      );
    }
  }, []);

  const fetchNearbyStores = async (lat: number, lng: number) => {
    if (!lat || !lng) return;

    const radius = 5000; // 5km
    const { data, error } = await supabase
      .from("stores")
      .select("id, latitude, longitude, name, area, genre, opening_hours");

    if (error) {
      console.error("🔥 Supabase Error:", error.message);
      return;
    }

    if (data) {
      console.log("📍 取得した店舗データ:", data);
      const filteredData = data
        .map((store) => ({
          id: store.id,
          lat: Number(store.latitude),
          lng: Number(store.longitude),
          name: store.name,
          area: store.area,
          genre: store.genre,
          isOpen: checkIfOpen(store.opening_hours).isOpen,
        }))
        .filter((store) => {
          const distance = Math.sqrt(
            Math.pow(store.lat - lat, 2) + Math.pow(store.lng - lng, 2)
          );
          return distance <= radius / 111000; // 1°が約111km
        });

      setLocations(showOnlyOpen ? filteredData.filter((s) => s.isOpen) : filteredData);
    }
  };

  const handleStoreClick = (id: string) => {
    router.push(`/stores/${id}`); // ✅ クリックで店舗詳細ページへ遷移
  };

  const handleMapDragEnd = () => {
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter();
      if (newCenter) {
        setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
        setShowSearchButton(true);
      }
    }
  };

  const handleSearchInThisArea = () => {
    if (mapCenter) {
      fetchNearbyStores(mapCenter.lat, mapCenter.lng);
      setShowSearchButton(false);
    }
  };

  if (!isLoaded || !mapCenter) return <p>Loading Google Maps...</p>;

  return (
    <div style={{ position: "relative" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={14}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        onDragEnd={handleMapDragEnd}
      >
        {/* 🔹 現在地を青いマーカーで表示 */}
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

        {/* 店舗のピンを表示 */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => {
              console.log("✅ ピンがクリックされた:", location);
              setSelectedStore(location);
            }}
            label={{
              text: location.name,
              color: "black",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          />
        ))}
      </GoogleMap>

      {/* 🔹 「このエリアで検索」ボタン & 営業中のみ表示 */}
      {showSearchButton && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "12px",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          <button
            onClick={handleSearchInThisArea} // ✅ 修正
            style={{
              backgroundColor: "#ff5722",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              border: "2px solid #e64a19",
              marginRight: "12px",
            }}
          >
            🔍 このエリアで検索
          </button>
          <label style={{ display: "flex", alignItems: "center", fontSize: "14px", color: "#333", fontWeight: "bold" }}>
            <input
              type="checkbox"
              checked={showOnlyOpen}
              onChange={() => setShowOnlyOpen(!showOnlyOpen)}
              style={{ marginRight: "6px", transform: "scale(1.2)" }}
            />
            営業中のみ表示
          </label>
        </div>
      )}

      {/* 🔹 クリックした店舗の詳細（タップ可能にする） */}
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
          onClick={() => handleStoreClick(selectedStore.id)}
        >
          <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>{selectedStore.name}</h2>
          <p>📍 {selectedStore.area} / 🎵 {selectedStore.genre}</p>
          <p style={{ color: selectedStore.isOpen ? "green" : "red", fontWeight: "bold" }}>
            {selectedStore.isOpen ? "営業中" : "営業時間外"}
          </p>
        </div>
      )}
    </div>
  );
}