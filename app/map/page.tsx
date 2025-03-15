"use client";
import React from "react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("../components/MapView"), { ssr: false });

export default function MapPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mt-4">ハコを地図で探す</h1>
      <MapView />
    </div>
  );
}