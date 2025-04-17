"use client";

import { useParams } from "next/navigation";
import type { Store } from "./StoreDetail";

type Props = {
  store: Store;
};

export default function StoreDescription({ store }: Props) {
  const { locale } = useParams() as { locale: string };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">{store.name}</h1>

      {locale === "ja" && store.description && (
        <p className="text-sm text-[#1F1F21] pt-4 leading-relaxed mb-4 whitespace-pre-line">
          {store.description}
        </p>
      )}
    </div>
  );
}