"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// 店舗データの型
type Store = {
  id: string;
  name: string;
  address: string;
  genre: string;
  capacity: number;
  area: string;
  payment_methods: string[] | null;
};

export default function SearchResults() {
  return (
    <Suspense fallback={<p className="text-gray-400 mt-6">ロード中...</p>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URLの検索パラメータを取得し、useMemoでキャッシュ
  const searchParams = useSearchParams();
  const selectedGenres = useMemo(() => searchParams.getAll("genre"), [searchParams]);
  const selectedAreas = useMemo(() => searchParams.getAll("area"), [searchParams]);
  const selectedPayments = useMemo(() => searchParams.getAll("payment"), [searchParams]);

  useEffect(() => {
    const fetchStores = async (): Promise<void> => {
      setLoading(true);

      let query = supabase.from("stores").select("*");

      // フィルターが適用されている場合のみ追加
      if (selectedGenres.length > 0) {
        query = query.in("genre", selectedGenres);
      }
      if (selectedAreas.length > 0) {
        query = query.in("area", selectedAreas);
      }
      if (selectedPayments.length > 0) {
        query = query.overlaps("payment_methods", selectedPayments);
      }

      const { data, error } = await query;

      if (error) {
        console.error("🔥 Supabase Error:", error.message);
        setError(error.message);
        setStores([]); // エラー時はデータをクリア
      } else {
        setStores(data || []);
      }

      setLoading(false);
    };

    fetchStores();
  }, [selectedGenres, selectedAreas, selectedPayments]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* 🔥 オトナビのロゴ（クリックでホームへ戻る） */}
      <Link href="/" passHref>
        <h1 className="text-4xl font-bold cursor-pointer transition">オトナビ</h1>
      </Link>

      {/* 🔥 エラーがある場合に表示 */}
      {error && <p className="text-red-400 mt-4">エラーが発生しました: {error}</p>}

      {loading ? (
        <p className="mt-6">ロード中...</p>
      ) : stores.length === 0 ? (
        <p className="text-gray-400 mt-6">該当する店舗がありません。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {stores.map((store) => (
            <Link key={store.id} href={`/stores/${store.id}`} passHref>
              <div className="p-4 bg-gray-800 rounded shadow cursor-pointer hover:bg-gray-700 transition">
                <h2 className="text-xl font-semibold">{store.name}</h2>
                <p className="text-gray-400">{store.genre} / {store.capacity}人</p>
                <p className="text-gray-300">{store.address}</p>
                <p className="text-gray-300">エリア: {store.area}</p>
                <p className="text-gray-300">
                  支払い方法: {Array.isArray(store.payment_methods) && store.payment_methods.length > 0
                    ? store.payment_methods.join(", ")
                    : "情報なし"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}