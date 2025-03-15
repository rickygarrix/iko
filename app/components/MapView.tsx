"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader, Circle } from "@react-google-maps/api";
import { supabase } from "@/lib/supabase";

const containerStyle = {
  width: "100%",
  height: "80vh",
};

const SEARCH_RADIUS = 5; // 5km

export default function MapView() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [locations, setLocations] = useState<{ id: string; lat: number; lng: number; name: string }[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 35.6895, lng: 139.6917 });
  const [showSearchButton, setShowSearchButton] = useState(false);
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
          fetchNearbyStores(newCenter.lat, newCenter.lng);
        },
        (error) => console.error("📍 現在地取得エラー:", error)
      );
    }
  }, []);

  // ✅ 5km圏内の店舗を取得（useCallbackでメモ化）
  const fetchNearbyStores = useCallback(async (lat: number, lng: number) => {
    if (!lat || !lng) return;

    const { data, error } = await supabase.from("stores").select("id, name, latitude, longitude");

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
        }))
        .filter((store) => getDistanceFromLatLonInKm(lat, lng, store.lat, store.lng) <= SEARCH_RADIUS);

      setLocations(filteredData);
    }
  }, []);

  // ✅ 緯度・経度から距離を計算（km単位）
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // 地球の半径（km）
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // ✅ 地図移動時に「ここで検索」ボタンを表示
  const handleMapDragEnd = () => {
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter();
      if (newCenter) {
        setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
        setShowSearchButton(true);
      }
    }
  };

  // ✅ 「ここで検索」ボタン押下時の動作
  const handleSearchInThisArea = () => {
    fetchNearbyStores(mapCenter.lat, mapCenter.lng);
    setShowSearchButton(false);
  };

  if (!isLoaded) return <p>Loading Google Maps...</p>;

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

        {/* 🔹 5km圏内の店舗のピンを表示 */}
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

      {/* 🔹 「ここで検索」ボタン */}
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
            onClick={handleSearchInThisArea}
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
            🔍 ここで検索する
          </button>
        </div>
      )}
    </div>
  );
}