"use client";

import { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
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
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
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
      center={{ lat: 35.6895, lng: 139.6917 }} // 東京
      zoom={14}
      onLoad={(map) => {
        mapRef.current = map;
      }}
    >
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