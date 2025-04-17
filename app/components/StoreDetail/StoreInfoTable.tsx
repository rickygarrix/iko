"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import type { Store } from "./StoreDetail";
import type { Messages } from "@/types/messages";

// 日本語の曜日から英語キーへの変換マップ
const jaToKeyMap = {
  "月曜": "Monday",
  "火曜": "Tuesday",
  "水曜": "Wednesday",
  "木曜": "Thursday",
  "金曜": "Friday",
  "土曜": "Saturday",
  "日曜": "Sunday",
} as const;

type JaDay = keyof typeof jaToKeyMap;
type EnDay = typeof jaToKeyMap[JaDay];

function translateOpeningHours(
  opening_hours: string,
  days: Record<EnDay, string>,
  closedLabel: string = "Closed"
): string {
  return opening_hours
    .split("\n")
    .map((line) => {
      const match = line.match(/^(.{1,2})曜\s*(.*)$/); // 例: 月曜 18:00~28:00 or 水曜 休み
      if (!match) return line;

      const jaDay = `${match[1]}曜` as JaDay;
      const timeOrClosed = match[2].trim();
      const key = jaToKeyMap[jaDay];
      const translated = days[key];

      const isClosed = timeOrClosed === "休み";
      return `${translated}${isClosed ? ` ${closedLabel}` : ` ${timeOrClosed}`}`;
    })
    .join("\n");
}

type StoreDetailMessages = Messages["storeDetail"] & {
  days: Record<EnDay, string>;
};

export default function StoreInfoTable({
  store,
  messages,
}: {
  store: Store & {
    genreTranslated?: string;
    areaTranslated?: string;
  };
  messages: StoreDetailMessages;
}) {
  const { locale } = useParams() as { locale: string };

  useEffect(() => {
    console.log("📦 [StoreInfoTable] messages:", messages);
    console.log("🏪 [StoreInfoTable] store:", store);
  }, [messages, store]);

  const translatedOpeningHours = translateOpeningHours(
    store.opening_hours,
    messages.days
  );

  return (
    <div className="my-10 px-4">
      <p className="text-base mb-2 flex items-center gap-2 font-[#1F1F21]">
        <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded-[2px] inline-block" />
        {messages.infoTitle}
      </p>
      <table className="w-full border border-[#E7E7EF] text-sm table-fixed">
        <tbody>
          <tr>
            <th className="border px-4 py-4 bg-[#FDFBF7] font-normal w-[90px]">
              {messages.name}
            </th>
            <td className="border px-4 py-4">{store.name}</td>
          </tr>
          <tr>
            <th className="border px-4 py-4 bg-[#FDFBF7] font-normal">
              {messages.genre}
            </th>
            <td className="border px-4 py-4">
              {store.genreTranslated ?? store.genre}
            </td>
          </tr>
          <tr>
            <th className="border px-4 py-4 bg-[#FDFBF7] font-normal">
              {messages.address}
            </th>
            <td className="border px-4 py-4 whitespace-pre-wrap">
              {store.address}
            </td>
          </tr>
          {locale === "ja" && store.access && (
            <tr>
              <th className="border px-4 py-4 bg-[#FDFBF7] font-normal">
                {messages.access}
              </th>
              <td className="border px-4 py-4 whitespace-pre-wrap">
                {store.access}
              </td>
            </tr>
          )}
          <tr>
            <th className="border px-4 py-4 bg-[#FDFBF7] font-normal">
              {messages.hours}
            </th>
            <td
              className={`border px-4 py-4 text-sm whitespace-pre text-zinc-800 tabular-nums ${locale === "en" ? "font-sans" : ""
                }`}
            >
              {translatedOpeningHours}
              <p className="text-[10px] text-gray-500 mt-1">{messages.note}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}