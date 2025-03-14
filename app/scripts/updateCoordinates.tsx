"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCoordinates } from "@/lib/getCoordinates";

export default function UpdateCoordinates() {
  const [updating, setUpdating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const updateCoordinates = async () => {
      setUpdating(true);
      setLogs([]);

      const { data: stores, error } = await supabase.from("stores").select("id, map");

      if (error) {
        console.error("データ取得エラー:", error.message);
        return;
      }

      for (const store of stores) {
        const coordinates = await getCoordinates(store.map);
        if (coordinates) {
          const { lat, lng } = coordinates;
          await supabase
            .from("stores")
            .update({ latitude: lat, longitude: lng })
            .eq("id", store.id);

          setLogs((prevLogs) => [...prevLogs, `更新完了: ${store.id} → ${lat}, ${lng}`]);
        }
      }
      setUpdating(false);
    };

    updateCoordinates();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">緯度経度更新ログ</h2>
      {updating ? <p>更新中...</p> : <p>更新完了</p>}
      <ul>
        {logs.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </div>
  );
}