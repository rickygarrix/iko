// components/StoreDetail/StorePaymentTable.tsx
import type { Store } from "./StoreDetail";
import type { Messages } from "@/types/messages";

export default function StorePaymentTable({
  store,
  messages,
}: {
  store: Store;
  messages?: Messages["storeDetail"]; // ← optional に変更
}) {
  return (
    <div className="mb-8 px-4">
      <p className="text-base mb-2 flex items-center gap-2 font-[#1F1F21]">
        <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded-[2px] inline-block" />
        {messages?.paymentTitle ?? ""}
      </p>
      <table className="w-full border border-[#E7E7EF] text-sm text-left text-black">
        <tbody>
          {["現金", "クレジットカード", "電子マネー", "コード決済", "交通系IC", "その他"]
            .reduce((rows, key, idx) => {
              if (idx % 2 === 0) rows.push([key]);
              else rows[rows.length - 1].push(key);
              return rows;
            }, [] as string[][])
            .map((row, i) => (
              <tr key={i}>
                {row.map((method, j) => (
                  <>
                    <td
                      className="border border-[#E7E7EF] px-3 py-2 w-[40%]"
                      key={`label-${j}`}
                    >
                      {method}
                    </td>
                    <td
                      className="border border-[#E7E7EF] px-3 py-2 w-[10%] text-center"
                      key={`val-${j}`}
                    >
                      {method === "その他"
                        ? "ー"
                        : store.payment_methods.includes(method)
                          ? "○"
                          : "ー"}
                    </td>
                  </>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}