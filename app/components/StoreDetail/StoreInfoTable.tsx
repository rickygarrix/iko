import type { Store } from "./StoreDetail";
import type { Messages } from "@/types/messages";
import { useEffect } from "react";

export default function StoreInfoTable({
  store,
  messages,
}: {
  store: Store & {
    genreTranslated?: string;
    areaTranslated?: string;
  };
  messages: Messages["storeDetail"];
}) {
  // デバッグ出力
  useEffect(() => {
    console.log("📦 [StoreInfoTable] messages:", messages);
    console.log("🏪 [StoreInfoTable] store:", store);
  }, [messages, store]);

  return (
    <div className="my-10 px-4">
      <p className="text-base mb-2 flex items-center gap-2 font-[#1F1F21]">
        <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded-[2px] inline-block" />
        {messages.infoTitle}
      </p>
      <table className="w-full border border-[#E7E7EF] text-sm table-fixed">
        <tbody>
          <tr>
            <th className="border px-4 py-4 bg-[#FDFBF7] font-normal w-[90px]">{messages.name}</th>
            <td className="border px-4 py-4">{store.name}</td>
          </tr>
          <tr>
            <th className="border px-4 py-4 bg-[#FDFBF7] font-normal">{messages.genre}</th>
            <td className="border px-4 py-4">{store.genreTranslated ?? store.genre}</td>
          </tr>
          <tr>
            <th className="border px-4 py-4 bg-[#FDFBF7] font-normal">{messages.address}</th>
            <td className="border px-4 py-4 whitespace-pre-wrap">{store.address}</td>
          </tr>
          <tr>
            <th className="border px-4 py-4 bg-[#FDFBF7] font-normal">{messages.access}</th>
            <td className="border px-4 py-4 whitespace-pre-wrap">{store.access}</td>
          </tr>
          <tr>
            <th className="border px-4 py-4 bg-[#FDFBF7] font-normal">{messages.hours}</th>
            <td className="border px-4 py-4 whitespace-pre-wrap">
              {store.opening_hours}
              <p className="text-[10px] text-gray-500 mt-1">{messages.note}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}