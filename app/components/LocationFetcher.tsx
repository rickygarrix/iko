import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getGeocode } from "@/lib/geocode";

export default function LocationFetcher({ storeId, address }: { storeId: string; address: string }) {
  useEffect(() => {
    const fetchAndStoreLocation = async () => {
      const location = await getGeocode(address);
      if (!location || !location.lat || !location.lng) {
        console.warn(`⚠️ Geocoding 失敗: ${address}`);
        return; // 無効なデータは保存しない
      }
      await supabase
        .from("stores")
        .update({
          latitude: location.lat,
          longitude: location.lng,
        })
        .eq("id", storeId);
    };

    fetchAndStoreLocation();
  }, [storeId, address]);

  return null; // 画面には表示しない
}