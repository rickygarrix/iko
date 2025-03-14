"use client";

import { LoadScript } from "@react-google-maps/api";
import { useState, useEffect } from "react";

export default function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);

  useEffect(() => {
    // クライアントサイドで環境変数を取得
    setGoogleMapsApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "");
  }, []);

  if (!googleMapsApiKey) {
    return <p>Loading...</p>; // APIキーが取得できるまで待つ
  }

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey} preventGoogleFontsLoading={true}>
      {children}
    </LoadScript>
  );
}