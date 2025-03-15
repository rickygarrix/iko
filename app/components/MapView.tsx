"use client";

import { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader, Circle } from "@react-google-maps/api";
import { supabase } from "@/lib/supabase";

const containerStyle = {
  width: "100%",
  height: "80vh",
};

export default function MapView() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [locations, setLocations] = useState<
    { id: string; lat: number; lng: number; name: string }[]
  >([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 35.6895, // デフォルトは東京
    lng: 139.6917,
  });
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    // ✅ 位置情報を取得
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCenter = { lat: latitude, lng: longitude };

          console.log("📍 現在地取得:", newCenter);
          setCurrentLocation(newCenter);
          setMapCenter(newCenter); // 初期値を現在地にセット
        },
        (error) => console.error("📍 現在地取得エラー:", error)
      );
    }

    // ✅ Supabaseから店舗データ取得
    const fetchStores = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, latitude, longitude");

      if (error) {
        console.error("🔥 Supabase Error:", error.message);
        return;
      }

      if (data) {
        setLocations(
          data.map((store) => ({
            id: store.id,
            lat: Number(store.latitude),
            lng: Number(store.longitude),
            name: store.name,
          }))
        );
      }
    };

    fetchStores();
  }, []);

  if (!isLoaded) return <p>Loading Google Maps...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter} // ✅ 初期位置を現在地にする
      zoom={14}
      onLoad={(map) => {
        mapRef.current = map;
      }}
    >
      {/* 🔹 現在地を青い円で表示 */}
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

      {/* 🔹 店舗のピンを表示 */}
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
        />
      ))}
    </GoogleMap>
  );
}