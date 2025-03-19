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
  const [zoomLevel, setZoomLevel] = useState(13);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const handleReturnToCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.panTo(currentLocation);
      setZoomLevel(14); // 🔹 ズームレベルを適切な大きさに変更
    }
  };

  useEffect(() => {

    const savedCenter = sessionStorage.getItem("mapCenter");
    const savedZoom = sessionStorage.getItem("mapZoom");
    const savedFilters = sessionStorage.getItem("filters");
    const savedLocations = sessionStorage.getItem("locations");
    const savedStore = sessionStorage.getItem("selectedStore"); // **選択した店舗情報を取得**

    if (savedCenter) setMapCenter(JSON.parse(savedCenter));
    if (savedZoom !== null) setZoomLevel(JSON.parse(savedZoom));

    if (savedFilters) {
      const { showOnlyOpen, selectedGenres } = JSON.parse(savedFilters);
      setShowOnlyOpen(showOnlyOpen);
      setSelectedGenres(selectedGenres);
    }

    if (savedLocations) {
      setLocations(JSON.parse(savedLocations));
    }

    // 🔹 locations の保存データがある場合は復元、なければ検索を実行
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

    const handleFullscreenChange = () => {
      setShowSearchButton(true);
    };

    if (savedStore) setSelectedStore(JSON.parse(savedStore)); // **戻ったときに店舗情報を復元**

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
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

      return filteredData; // 🔹 検索結果を返すように変更
    }

    return [];
  };

  const handleStoreClick = (store: Store) => {
    if (mapRef.current) {
      const map = mapRef.current;
      sessionStorage.setItem("mapCenter", JSON.stringify({ lat: store.lat, lng: store.lng })); // 修正
      sessionStorage.setItem("mapZoom", JSON.stringify(map.getZoom()));
      sessionStorage.setItem("selectedStore", JSON.stringify(store));
    }

    router.push(`/stores/${store.id}?prev=/map&${queryParams}`);
  };

  const handleMarkerClick = (store: Store) => {
    if (mapRef.current) {
      const map = mapRef.current;
      const startLat = map.getCenter()?.lat() || store.lat;
      const startLng = map.getCenter()?.lng() || store.lng;
      const endLat = store.lat;
      const endLng = store.lng;

      let step = 0;
      const steps = 30;
      const duration = 300;
      const intervalTime = duration / steps;

      const animatePan = () => {
        step++;
        const progress = step / steps;
        const easeProgress = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

        const newLat = startLat + (endLat - startLat) * easeProgress;
        const newLng = startLng + (endLng - startLng) * easeProgress;
        map.panTo({ lat: newLat, lng: newLng });

        if (step < steps) {
          requestAnimationFrame(animatePan);
        } else {
          sessionStorage.setItem("mapCenter", JSON.stringify({ lat: endLat, lng: endLng }));
          sessionStorage.setItem("mapZoom", JSON.stringify(map.getZoom()));
          sessionStorage.setItem("selectedStore", JSON.stringify(store));
          setSelectedStore(store);
        }
      };

      requestAnimationFrame(animatePan);
    }
  };
  const handleSearchInThisArea = async () => {
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter();
      const newZoom = mapRef.current.getZoom() || 13;

      if (!newCenter) return;

      // 🔹 検索処理を実行（修正: newCenter の lat, lng を使用）
      const results = await fetchNearbyStores(newCenter.lat(), newCenter.lng(), showOnlyOpen, selectedGenres);

      // 🔹 セッションストレージに保存
      sessionStorage.setItem("mapCenter", JSON.stringify({ lat: newCenter.lat(), lng: newCenter.lng() }));
      sessionStorage.setItem("mapZoom", JSON.stringify(newZoom));
      sessionStorage.setItem("filters", JSON.stringify({ showOnlyOpen, selectedGenres }));
      sessionStorage.setItem("locations", JSON.stringify(results)); // 🔹 検索結果を保存

      // 🔹 状態更新（修正: newCenter を適用）
      setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
      setZoomLevel(newZoom);
      setLocations(results); // 🔹 検索結果を更新
    }

    setShowSearchButton(false);
  };

  const handleFilterChange = () => {
    const newShowOnlyOpen = !showOnlyOpen;
    setShowOnlyOpen(newShowOnlyOpen);
    sessionStorage.setItem("filters", JSON.stringify({ showOnlyOpen: newShowOnlyOpen, selectedGenres }));

    fetchNearbyStores(mapCenter.lat, mapCenter.lng, newShowOnlyOpen, selectedGenres).then((results) => {
      setLocations(results);
      sessionStorage.setItem("locations", JSON.stringify(results)); // 🔹 検索結果を保存
    });
  };

  const handleGenreChange = (genre: string) => {
    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];

    setSelectedGenres(newGenres);
    sessionStorage.setItem("filters", JSON.stringify({ showOnlyOpen, selectedGenres: newGenres }));

    fetchNearbyStores(mapCenter.lat, mapCenter.lng, showOnlyOpen, newGenres).then((results) => {
      setLocations(results);
      sessionStorage.setItem("locations", JSON.stringify(results)); // 🔹 検索結果を保存
    });
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
            setZoomLevel(mapRef.current.getZoom() || 13);
            setShowSearchButton(true);
          }
        }}
      >
        {currentLocation && (
          <Circle center={currentLocation} radius={50} options={{ strokeColor: "#007bff", fillColor: "#007bff", fillOpacity: 0.35 }} />
        )}

        {locations.map((store) => ( // ✅ store を map のコールバック関数の引数として受け取る
          <Marker
            key={store.id}
            position={{ lat: store.lat, lng: store.lng }}
            label={{ text: store.name, color: "black", fontSize: "12px", fontWeight: "bold" }}
            onClick={() => handleMarkerClick(store)}
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
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            backgroundColor: "white",
            padding: "16px",
            textAlign: "center",
            color: "black",
            fontSize: "16px",
            cursor: "pointer"
          }}
          onClick={() => router.push(`/stores/${selectedStore.id}?prev=/map&${queryParams}`)}
        >
          <h2>{selectedStore.name}</h2>
          <p>🎵 {selectedStore.genre} | 📍 {selectedStore.area}</p>
          <p style={{ fontWeight: "bold", color: selectedStore.isOpen ? "green" : "red" }}>
            {selectedStore.isOpen ? "営業中" : "営業時間外"}
          </p>
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
