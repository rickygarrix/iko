"use client";

import StoreDetail from "@/components/StoreDetail/StoreDetail";
import type { Messages } from "@/types/messages";

// StoreDetail 側で useParams や Supabase の取得処理を行うので、ここでは messages を渡すだけ

type Props = {
  messages: Messages["storeDetail"];
};

export default function StorePage(props: Props) {
  return <StoreDetail {...props} />;
}