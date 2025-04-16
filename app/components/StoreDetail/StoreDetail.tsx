"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { logAction } from "@/lib/utils";
import Skeleton from "@/components/Skeleton";
import InstagramSlider from "@/components/InstagramSlider";
import StoreMap from "./StoreMap";
import StoreDescription from "./StoreDescription";
import StorePaymentTable from "./StorePaymentTable";
import StoreInfoTable from "./StoreInfoTable";
import StoreWebsiteButton from "./StoreWebsiteButton";
import type { Messages } from "@/types/messages";

export type Store = {
  id: string;
  name: string;
  genre: string;
  area: string;
  name_read?: string;
  entry_fee: string;
  opening_hours: string;
  regular_holiday: string;
  capacity: string;
  instagram: string | null;
  payment_methods: string[];
  address: string;
  phone: string;
  website?: string;
  image_url?: string;
  description: string;
  access: string;
  map_embed?: string;
  map_link?: string;
  store_instagrams?: string | null;
  store_instagrams2?: string | null;
  store_instagrams3?: string | null;
};

type Props = {
  messages: Messages["storeDetail"];
};

export default function StoreDetail({ messages }: Props) {
  const { id } = useParams();
  const { data: store, error, isLoading } = useSWR<Store>(
    id ? ["store", id] : null,
    async ([, id]) => {
      const { data } = await supabase.from("stores").select("*").eq("id", id).single();
      return data;
    },
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (id) {
      logAction("open_store", { store_id: id, referrer_page: document.referrer || null });
    }
  }, [id]);

  const handleLog = async (action: string, detail?: string) => {
    if (id) await logAction(action, { store_id: id, ...(detail ? { detail } : {}) });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FEFCF6] text-gray-800 pt-[48px] flex justify-center">
        <div className="w-full max-w-[600px] p-6 space-y-6">
          <Skeleton width="100%" height={24} />
          <Skeleton width="60%" height={16} />
          <Skeleton width="100%" height={80} />
          <Skeleton width="100%" height={200} />
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-[#FEFCF6] text-center pt-[100px] text-red-500">
        店舗が見つかりませんでした。
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCF6] text-gray-800 pt-[48px]">
      <div className="w-full max-w-[600px] mx-auto bg-[#FDFBF7] shadow-md rounded-lg">
        <StoreMap store={store} messages={messages} onClick={() => handleLog("click_map")} />
        <StoreDescription store={store} messages={messages} />
        <StorePaymentTable store={store} messages={messages} />
        <StoreInfoTable store={store} messages={messages} />
        <InstagramSlider
          posts={[store.store_instagrams, store.store_instagrams2, store.store_instagrams3].filter(
            (url): url is string => Boolean(url)
          )}
          onClickPost={(url) => handleLog("click_instagram_post", url)}
        />
        {store.website && (
          <StoreWebsiteButton
            href={store.website}
            label={messages.website}
            onClick={() => handleLog("click_website")}
          />
        )}
      </div>
    </div>
  );
}