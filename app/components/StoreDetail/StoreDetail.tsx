"use client";

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
import type { Locale } from "@/i18n/config";

export type Store = {
  id: string;
  name: string;
  genre: string;
  area: string;
  genreTranslated?: string;
  areaTranslated?: string;
  name_read?: string;
  entry_fee: string;
  opening_hours: string;
  regular_holiday: string;
  capacity: string;
  instagram: string | null;
  payment_methods: string[];
  payment_method_ids: string[];
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
  id: string;
  locale: Locale;
  messages: Messages["storeDetail"];
};

const fetchStoreDetail = async ([, id, locale]: [string, string, string]): Promise<Store & { payments?: Record<string, string> }> => {
  const { data: storeData, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq("id", id)
    .single();

  if (storeError || !storeData) {
    throw new Error("店舗データが見つかりません");
  }

  const [{ data: genreData }, { data: areaData }, { data: paymentData }] = await Promise.all([
    supabase.from("genre_translations").select("name").eq("genre_id", storeData.genre_id).eq("locale", locale).single(),
    supabase.from("area_translations").select("name").eq("area_id", storeData.area_id).eq("locale", locale).single(),
    supabase.from("payment_method_translations").select("payment_method_id, name").eq("locale", locale)
  ]);

  const paymentMap: Record<string, string> = {};
  paymentData?.forEach((p) => {
    paymentMap[p.payment_method_id] = p.name;
  });

  return {
    ...storeData,
    genreTranslated: genreData?.name ?? storeData.genre_id,
    areaTranslated: areaData?.name ?? storeData.area_id,
    payments: paymentMap,
  };
};

export default function StoreDetail({ id, locale, messages }: Props) {
  const { data: store, error, isLoading } = useSWR<Store & { payments?: Record<string, string> }>(
    ["store", id, locale],
    fetchStoreDetail,
    { revalidateOnFocus: false }
  );

  const handleLog = async (action: string, detail?: string) => {
    if (id) {
      await logAction(action, {
        store_id: id,
        ...(detail ? { detail } : {}),
      });
    }
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
        <StoreMap
          store={store}
          messages={messages}
          onClick={async () => {
            await handleLog("click_map");
            window.open(store.map_link || "#", "_blank", "noopener");
          }}
        />
        <StoreDescription store={store} messages={messages} />
        <StorePaymentTable store={store} messages={{ ...messages, payments: store.payments }} />
        <StoreInfoTable store={store} messages={messages} />
        <InstagramSlider
          posts={[store.store_instagrams, store.store_instagrams2, store.store_instagrams3].filter(
            (url): url is string => Boolean(url)
          )}
          onClickPost={async (url) => {
            await handleLog("click_instagram_post", url);
            window.open(url, "_blank", "noopener");
          }}
        />
        {store.website && messages?.website && (
          <StoreWebsiteButton
            href={store.website}
            label={messages.website}
            onClick={async () => {
              await handleLog("click_website");
              window.open(store.website, "_blank", "noopener");
            }}
          />
        )}
      </div>
    </div>
  );
}