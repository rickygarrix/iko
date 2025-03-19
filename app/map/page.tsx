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

const SEARCH_RADIUS = 5;
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

const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
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
  const queryParams = searchParams.toString();
  const [locations, setLocations] = useState<Store[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 35.6895, lng: 139.6917 });
  const [showSearchButton, setShowSearchButton] = useState(true);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const savedCenter = sessionStorage.getItem("mapCenter");
    const savedZoom = sessionStorage.getItem("mapZoom");
    const savedFilters = sessionStorage.getItem("filters");
    const savedLocations = sessionStorage.getItem("locations");
    const savedStore = sessionStorage.getItem("selectedStore");

    if (savedCenter) setMapCenter(JSON.parse(savedCenter));
    if (savedZoom !== null) setZoomLevel(JSON.parse(savedZoom));

    if (savedFilters) {
      const { showOnlyOpen, selectedGenres } = JSON.parse(savedFilters);
      setShowOnlyOpen(showOnlyOpen);
      setSelectedGenres(selectedGenres);
    }

    if (savedLocations) {
      setLocations(JSON.parse(savedLocations));
    } else {
      fetchNearbyStores(mapCenter.lat, mapCenter.lng, showOnlyOpen, selectedGenres).then((results) => {
        setLocations(results);
        sessionStorage.setItem("locations", JSON.stringify(results));
      });
    }

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

    if (savedStore) setSelectedStore(JSON.parse(savedStore));

  }, []);

  const fetchNearbyStores = async (lat: number, lng: number, filterOpen: boolean, genres: string[]): Promise<Store[]> => {
    if (!lat || !lng) return [];

    const { data, error } = await supabase
      .from("stores")
      .select("id, name, latitude, longitude, genre, area, image_url, opening_hours");

    if (error) {
      console.error("🔥 Supabase Error:", error.message);
      return [];
    }

    return data.map((store) => ({
      id: store.id,
      name: store.name,
      lat: Number(store.latitude),
      lng: Number(store.longitude),
      genre: store.genre,
      area: store.area,
      image_url: store.image_url || "/default-image.jpg",
      opening_hours: store.opening_hours || "営業時間情報なし",
      isOpen: !!store.opening_hours,
      displayText: "営業中",
      nextOpening: "不明"
    }));
  };

  const handleMarkerClick = (store: Store) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat: store.lat, lng: store.lng });
      setSelectedStore(store);

      sessionStorage.setItem("mapCenter", JSON.stringify({ lat: store.lat, lng: store.lng }));
      sessionStorage.setItem("mapZoom", JSON.stringify(mapRef.current.getZoom()));
      sessionStorage.setItem("selectedStore", JSON.stringify(store));
    }
  };

  const handleSearchInThisArea = async () => {
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter();
      const newZoom = mapRef.current.getZoom() || 13;

      if (!newCenter) return;

      const results = await fetchNearbyStores(newCenter.lat(), newCenter.lng(), showOnlyOpen, selectedGenres);

      sessionStorage.setItem("mapCenter", JSON.stringify({ lat: newCenter.lat(), lng: newCenter.lng() }));
      sessionStorage.setItem("mapZoom", JSON.stringify(newZoom));
      sessionStorage.setItem("filters", JSON.stringify({ showOnlyOpen, selectedGenres }));
      sessionStorage.setItem("locations", JSON.stringify(results));

      setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
      setZoomLevel(newZoom);
      setLocations(results);
    }

    setShowSearchButton(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoomLevel}
        options={{ gestureHandling: "greedy", disableDefaultUI: true }}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      >
        {currentLocation && (
          <Circle center={currentLocation} radius={50} options={{ strokeColor: "#007bff", fillColor: "#007bff", fillOpacity: 0.35 }} />
        )}

        {locations.map((store) => (
          <Marker key={store.id} position={{ lat: store.lat, lng: store.lng }} onClick={() => handleMarkerClick(store)} />
        ))}
      </GoogleMap>

      {showSearchButton && (
        <button onClick={handleSearchInThisArea} style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", backgroundColor: "#FFA500", padding: "10px", borderRadius: "10px" }}>
          🔍 このエリアで検索する
        </button>
      )}

      {selectedStore && (
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", backgroundColor: "white", padding: "16px", textAlign: "center", cursor: "pointer" }} onClick={() => router.push(`/stores/${selectedStore.id}?prev=/map&${queryParams}`)}>
          <h2>{selectedStore.name}</h2>
          <p>{selectedStore.genre} | {selectedStore.area}</p>
          <p style={{ fontWeight: "bold", color: selectedStore.isOpen ? "green" : "red" }}>{selectedStore.isOpen ? "営業中" : "営業時間外"}</p>
        </div>
      )}
    </div>
  );
}