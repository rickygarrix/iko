"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// 型定義
interface Store {
  id: string;
  name: string;
  genre: string;
  area: string;
}

export default function SearchBar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Store[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setResults([]);
      return;
    }

    const fetchStores = async (): Promise<void> => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, genre, area")
        .or(
          `name.ilike.%${searchTerm}%,genre.ilike.%${searchTerm}%,area.ilike.%${searchTerm}%`
        )
        .limit(5);

      if (error) {
        console.error("🔥 検索エラー:", error.message);
      } else {
        setResults(data || []);
      }
    };

    fetchStores();
  }, [searchTerm]);

  return (
    <div className="relative w-full">
      {/* 🔹 検索バー */}
      <input
        type="text"
        placeholder="店名・エリア・ジャンル"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* 🔹 検索結果の表示 */}
      {isFocused && results.length > 0 && (
        <ul className="absolute left-0 w-full bg-white border rounded-lg shadow-lg mt-2 z-10">
          {results.map((store) => (
            <li
              key={store.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => router.push(`/stores/${store.id}`)}
            >
              <p className="text-lg font-semibold">{store.name}</p>
              <p className="text-sm text-gray-600">{store.genre} | {store.area}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
