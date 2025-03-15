"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

type Store = {
  id: string;
  name: string;
  genre: string;
  area: string;
  image_url?: string;
};

interface SelectedStoreProps {
  store: Store | null;
}

export default function SelectedStore({ store }: SelectedStoreProps) {
  const router = useRouter();

  if (!store) return null;

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
    </div>
  );
}