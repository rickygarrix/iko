"use client";

import { useParams } from "next/navigation";
import type { Store } from "./StoreDetail";

type Props = {
  store: Store;
  messages: {
    descriptionLabel: string;
  };
};

export default function StoreDescription({ store, messages }: Props) {
  const { locale } = useParams() as { locale: string };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">{store.name}</h1>

      {locale === "ja" && store.description && (
        <>
          <p className="text-xs font-bold text-gray-500 mb-1">{messages.descriptionLabel}</p>
          <p className="text-sm text-[#1F1F21] pt-1 leading-relaxed mb-4 whitespace-pre-line">
            {store.description}
          </p>
        </>
      )}
    </div>
  );
}