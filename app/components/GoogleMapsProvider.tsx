"use client";

import { LoadScript } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

export default function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  if (typeof window !== "undefined" && window.google) {
    return <>{children}</>; // ✅ Google APIがすでにロード済みなら再ロードしない
  }

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      {children}
    </LoadScript>
  );
}