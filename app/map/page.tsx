"use client"; // ✅ 追加

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function MapPage() {
  return (
    <div>
      <MapView />
    </div>
  );
}