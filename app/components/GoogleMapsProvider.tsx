"use client";

import { LoadScript } from "@react-google-maps/api";
import { useState, useEffect } from "react";

export default function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);

  useEffect(() => {
    setGoogleMapsApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "");
  }, []);

  if (!googleMapsApiKey) {
    return <p className="text-center text-white">Google Maps 読み込み中...</p>;
  }

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey}>
      {children}
    </LoadScript>
  );
}