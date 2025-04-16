import type { Store } from "./StoreDetail";
import type { Messages } from "@/types/messages";

type Props = {
  store: Store;
  messages: Messages["storeDetail"];
};

export default function StoreDescription({ store, messages }: Props) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">{store.name}</h1>
      <p className="text-sm text-[#1F1F21] pt-4 leading-relaxed mb-4 whitespace-pre-line">
        {store.description || messages.descriptionLabel}
      </p>
    </div>
  );
}