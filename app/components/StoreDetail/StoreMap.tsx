import MapEmbed from "@/components/MapEmbed";
import type { Store } from "./StoreDetail";
import type { Messages } from "@/types/messages";

type Props = {
  store: Store;
  messages?: Messages["storeDetail"];
  onClick: () => Promise<void>;
};

export default function StoreMap({ store, messages, onClick }: Props) {
  if (!store.map_embed) {
    console.log("⛔ map_embed がありません。スキップします。");
    return null;
  }

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    console.log("🟡 GoogleMapクリック検知");
    try {
      console.log("🟢 ログ送信開始...");
      await onClick();
      console.log("✅ ログ送信完了。タブを開きます:", store.map_link);
      window.open(store.map_link || "#", "_blank", "noopener");
    } catch (err) {
      console.error("🔥 MAPログ送信失敗:", err);
    }
  };

  return (
    <div className="mb-4">
      <a
        href={store.map_link || "#"}
        onClick={handleClick}
        className="block"
      >
        <MapEmbed
          src={store.map_embed!}
          title={`${store.name}${messages?.mapTitle ?? ""}`}
        />
      </a>
    </div>
  );
}