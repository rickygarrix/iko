"use client";
import { LoadScript } from "@react-google-maps/api";
import { useEffect, useState } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const [shouldLoadScript, setShouldLoadScript] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAlreadyLoaded = !!(window as any).google?.maps;
      setShouldLoadScript(!isAlreadyLoaded);
    }
  }, []);

  if (!shouldLoadScript) {
    // もうgoogle.mapsあるなら、素通り
    return <>{children}</>;
  }

  // 無いなら初回ロードする
  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} loadingElement={<div>Loading...</div>}>
      {children}
    </LoadScript>
  );
}