"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { parseOpeningHours } from "@/lib/parseOpeningHours"; // ✅ 営業時間判定を追加

export default function SelectedStore({ store }: { store: { id: string; name: string; genre: string; area: string; image_url?: string; opening_hours?: string } }) {
  const router = useRouter();
  if (!store) return null;

  // ✅ 営業時間判定の適用
  const { displayText, isOpen } = parseOpeningHours(store.opening_hours);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "white",
        padding: "16px",
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
        boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        color: "black",
        fontSize: "16px",
        cursor: "pointer",
      }}
      onClick={() => router.push(`/stores/${store.id}`)}
    >
      <Image
        src={store.image_url || "/default-image.jpg"}
        alt={store.name}
        width={100}
        height={100}
        className="rounded"
      />
      <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>{store.name}</h2>
      <p>🎵 ジャンル: {store.genre}</p>
      <p>📍 エリア: {store.area}</p>

      {/* ✅ 営業時間情報の表示 */}
      <p style={{ fontSize: "14px", color: "#555", marginTop: "8px" }}>
        ⏰ {displayText}
      </p>
      <p style={{ fontSize: "14px", fontWeight: "bold", color: isOpen ? "green" : "red" }}>
        {isOpen ? "営業中" : "営業時間外"}
      </p>
    </div>
  );
}