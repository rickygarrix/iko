// components/StoreDetail/StoreMap.tsx
import MapEmbed from "@/components/MapEmbed";
import type { Store } from "./StoreDetail";
import type { Messages } from "@/types/messages";

type Props = {
  store: Store;
  messages?: Messages["storeDetail"]; // ← optional に変更
  onClick: () => Promise<void>;
};

export default function StoreMap({ store, messages, onClick }: Props) {
  if (!store.map_embed) return null;

  return (
    <div className="mb-4">
      <a href={store.map_link || "#"} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        <MapEmbed src={store.map_embed} title={`${store.name}${messages?.mapTitle ?? ""}`} />
      </a>
    </div>
  );
}