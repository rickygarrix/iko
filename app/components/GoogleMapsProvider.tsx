"use client";
import { LoadScript } from "@react-google-maps/api";
import { useEffect, useState } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

type GoogleMapsWindow = typeof window & {
  google?: {
    maps?: unknown;
  };
};

export default function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const [shouldLoadScript, setShouldLoadScript] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as GoogleMapsWindow;
      const isAlreadyLoaded = !!win.google?.maps;
      setShouldLoadScript(!isAlreadyLoaded);
    }
  }, []);

  if (!shouldLoadScript) {
    return <>{children}</>;
  }

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} loadingElement={<div>Loading...</div>}>
      {children}
    </LoadScript>
  );
}