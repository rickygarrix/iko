"use client";

import { Circle } from "@react-google-maps/api";

interface CurrentLocationProps {
  currentLocation: { lat: number; lng: number } | null;
}

export default function CurrentLocation({ currentLocation }: CurrentLocationProps) {
  if (!currentLocation) return null;

  return (
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
  );
}