"use client";

import { GoogleMap, Marker, Circle } from "@react-google-maps/api";

type MapContainerProps = {
  mapCenter: { lat: number; lng: number };
  locations: { id: string; name: string; lat: number; lng: number }[];
  onMapLoad: (map: google.maps.Map) => void;
  onMapMove: () => void;
  currentLocation?: { lat: number; lng: number } | null;
};

const containerStyle = {
  width: "100%",
  height: "85vh",
};

export default function MapContainer({
  mapCenter,
  locations,
  onMapLoad,
  onMapMove,
  currentLocation,
}: MapContainerProps) {
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={13}
      options={{
        gestureHandling: "greedy",
        fullscreenControl: false,
        disableDefaultUI: true,
      }}
      onLoad={onMapLoad}
      onDragEnd={onMapMove}
    >
      {currentLocation && (
        <Circle
          center={currentLocation}
          radius={50}
          options={{ strokeColor: "#007bff", fillColor: "#007bff", fillOpacity: 0.35 }}
        />
      )}

      {locations.map((location) => (
        <Marker key={location.id} position={{ lat: location.lat, lng: location.lng }} />
      ))}
    </GoogleMap>
  );
}