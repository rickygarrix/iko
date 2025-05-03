"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { checkIfOpen } from "@/lib/utils";
import type { Messages } from "@/types/messages";
import type { MouseEvent } from "react";

const convertToAMPM = (time24: string): string => {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
};

const formatCloseTime = (
  time: string,
  locale: string,
  messages: Messages["recommend"] | Messages["searchResults"]
) => {
  const formatted = locale === "en" ? convertToAMPM(time) : time;
  return messages.openUntil.replace("{time}", formatted);
};

const formatNextOpening = (
  nextOpening: { day: string; time: string },
  locale: string,
  messages: Messages["recommend"] | Messages["searchResults"]
) => {
  const formatted = locale === "en" ? convertToAMPM(nextOpening.time) : nextOpening.time;
  const day = messages.days[nextOpening.day as keyof typeof messages.days] || nextOpening.day;
  return messages.nextOpen.replace("{day}", day).replace("{time}", formatted);
};

export type StoreCardProps = {
  store: {
    id: string;
    name: string;
    description?: string;
    genre_ids: string[];
    areaTranslated?: string;
    opening_hours: string;
    image_url?: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  locale: string;
  index: number;
  genresMap: Record<string, string>;
  translatedDescription?: string;
  messages: Messages["recommend"] | Messages["searchResults"];
  onClick: (storeId: string) => void;
  onMapClick: (e: MouseEvent, storeId: string) => void;
  delay?: number;
  mapClickEventName?: string;
};

export default function StoreCard({
  store,
  locale,
  index,
  genresMap,
  translatedDescription,
  messages,
  onClick,
  onMapClick,
  delay = 0,
}: StoreCardProps) {
  const { isOpen, nextOpening, closeTime } = checkIfOpen(store.opening_hours);

  const staticMapUrl =
    store.latitude !== null && store.longitude !== null
      ? `https://maps.googleapis.com/maps/api/staticmap?center=${store.latitude},${store.longitude}&zoom=16&size=100x165&scale=2&maptype=roadmap&markers=color:red%7C${store.latitude},${store.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      : null;

  return (
    <motion.div
      onClick={() => onClick(store.id)}
      className="w-full max-w-[520px] p-5 bg-white flex flex-row gap-5 rounded-lg transition-colors duration-200 cursor-pointer hover:bg-gray-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex flex-col justify-between flex-1">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-zinc-900">{store.name}</h3>
          {store.description && (
            <p className="text-sm font-normal text-zinc-800 leading-snug line-clamp-2">
              {locale === "ja" ? store.description : translatedDescription || store.description}
            </p>
          )}
          <p className="text-sm text-zinc-700 whitespace-pre-wrap">
            {store.areaTranslated}
            {"\n"}
            {store.genre_ids.map((gid) => genresMap[gid] || gid).join(" / ")}
          </p>
          <div className="flex flex-col text-sm">
            <span className={`font-bold ${isOpen ? "text-green-700" : "text-rose-700"}`}>
              {isOpen ? messages.open : messages.closed}
            </span>
            <span className="text-zinc-700">
              {isOpen && closeTime
                ? formatCloseTime(closeTime, locale, messages)
                : nextOpening
                  ? formatNextOpening(nextOpening, locale, messages)
                  : ""}
            </span>
          </div>
        </div>
      </div>
      <a
        href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-[120px] h-[180px] rounded-md overflow-hidden border-2 border-[#1F1F21] block"
        onClick={(e) => onMapClick(e, store.id)}
      >
        <Image
          src={staticMapUrl || store.image_url || "/default-image.jpg"}
          alt={store.name}
          width={120}
          height={180}
          style={{ objectFit: "cover" }}
          unoptimized
        />
      </a>
    </motion.div>
  );
}