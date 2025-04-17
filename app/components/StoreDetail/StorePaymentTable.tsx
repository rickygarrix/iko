import type { Store } from "./StoreDetail";
import type { Messages } from "@/types/messages";
import React from "react";

export default function StorePaymentTable({
  store,
  messages,
}: {
  store: Store;
  messages?: Messages["storeDetail"] & { payments?: { [key: string]: string } };
}) {
  const paymentKeys = ["cash", "credit", "e_money", "code", "ic", "other"];

  const displayRows = paymentKeys.reduce((rows, key, idx) => {
    if (idx % 2 === 0) rows.push([key]);
    else rows[rows.length - 1].push(key);
    return rows;
  }, [] as string[][]);

  const hasPayment = Array.isArray(store.payment_method_ids);

  return (
    <div className="mb-8 px-4">
      <p className="text-base mb-2 flex items-center gap-2 font-[#1F1F21]">
        <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded-[2px] inline-block" />
        {messages?.paymentTitle ?? ""}
      </p>
      <table className="w-full border border-[#E7E7EF] text-sm text-left text-black">
        <tbody>
          {displayRows.map((row, i) => (
            <tr key={i}>
              {row.map((method, j) => (
                <React.Fragment key={j}>
                  <td className="border border-[#E7E7EF] px-3 py-2 w-[40%]">
                    {messages?.payments?.[method] ?? method}
                  </td>
                  <td className="border border-[#E7E7EF] px-3 py-2 w-[10%] text-center">
                    {method === "other"
                      ? "ー"
                      : hasPayment && store.payment_method_ids.includes(method)
                        ? "○"
                        : "ー"}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}