"use client";

import { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker, Circle } from "@react-google-maps/api";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { parseOpeningHours } from "@/lib/parseOpeningHours"; // ✅ 追加

const containerStyle = {
  width: "100%",
  height: "80vh",
};

const SEARCH_RADIUS = 5; // 5km

export default function MapView() {
  const router = useRouter();
  const [locations, setLocations] = useState<
    { id: string; lat: number; lng: number; name: string; genre: string; area: string; image_url?: string; opening_hours?: string }[]
  >([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 35.6895, lng: 139.6917 });
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [selectedStore, setSelectedStore] = useState<
    { id: string; name: string; genre: string; area: string; image_url?: string; opening_hours?: string } | null
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

  const fetchNearbyStores = async (lat: number, lng: number) => {
    if (!lat || !lng) return;

    const { data, error } = await supabase.from("stores").select("id, name, latitude, longitude, genre, area, image_url, opening_hours");

    if (error) {
      console.error("🔥 Supabase Error:", error.message);
      return;
    }

    if (data) {
      const filteredData = data
        .map((store) => ({
          id: store.id,
          name: store.name,
          lat: Number(store.latitude),
          lng: Number(store.longitude),
          genre: store.genre,
          area: store.area,
          image_url: store.image_url || "/default-image.jpg",
          opening_hours: store.opening_hours || "営業時間情報なし",
        }))
        .filter((store) => getDistanceFromLatLonInKm(lat, lng, store.lat, store.lng) <= SEARCH_RADIUS);

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
    fetchNearbyStores(mapCenter.lat, mapCenter.lng);
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
        onDragEnd={handleMapDragEnd}
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
        <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)" }}>
          <button onClick={handleSearchInThisArea} className="bg-orange-500 text-white p-2 rounded shadow-lg">
            🔍 ここで検索する
          </button>
        </div>
      )}

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
          onClick={() => router.push(`/stores/${selectedStore.id}`)}
        >
          <Image
            src={selectedStore.image_url || "/default-image.jpg"}
            alt={selectedStore.name}
            width={100}
            height={100}
            className="rounded"
          />
          <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>{selectedStore.name}</h2>
          <p>🎵 ジャンル: {selectedStore.genre}</p>
          <p>📍 エリア: {selectedStore.area}</p>

          {/* ✅ 営業時間の追加 */}
          {selectedStore.opening_hours && (
            (() => {
              const { displayText, isOpen } = parseOpeningHours(selectedStore?.opening_hours);

              <p style={{ fontSize: "14px", color: "#555", marginTop: "8px" }}>
                ⏰ {displayText}
              </p>
              return (
                <>
                  <p style={{ fontSize: "14px", fontWeight: "bold", color: isOpen ? "green" : "red" }}>
                    {isOpen ? "営業中" : "営業時間外"}
                  </p>
                </>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
}