"use client";

import { useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 35.6895, // 東京の緯度
  lng: 139.6917, // 東京の経度
};

export default function MapView() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  if (!isLoaded) return <p className="text-center text-white">地図を読み込み中...</p>;

  return (
    <div className="mt-6">
      <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={12} />
    </div>
  );
}