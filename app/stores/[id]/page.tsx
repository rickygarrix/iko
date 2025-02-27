import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function StoreDetail({ params }: { params: { id: string } }) {
  // `id` に該当する店舗データを取得
  const { data: store, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!store || error) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-blue-400">{store.name}</h1>
        <p className="text-lg mb-4">{store.genre} / {store.capacity}人</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-gray-300">📍 住所:</p>
            <p className="text-gray-400">{store.address}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-300">⏰ 営業時間:</p>
            <p className="text-gray-400">{store.opening_hours}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-300">💰 入場料:</p>
            <p className="text-gray-400">{store.entry_fee}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-300">🍹 アルコール提供:</p>
            <p className="text-gray-400">{store.alcohol ? "あり" : "なし"}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-300">📞 電話番号:</p>
            <p className="text-gray-400">{store.phone_number}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-300">📅 定休日:</p>
            <p className="text-gray-400">{store.regular_holiday}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-300">📌 予約:</p>
            <p className="text-gray-400">{store.reservation}</p>
          </div>
        </div>

        {/* 公式サイト & Instagram */}
        <div className="mt-6">
          {store.website && (
            <a href={store.website} target="_blank" className="text-blue-400 hover:underline block">
              🌍 公式サイト
            </a>
          )}
          {store.instagram && (
            <a href={store.instagram} target="_blank" className="text-pink-400 hover:underline block">
              📷 Instagram
            </a>
          )}
        </div>

        {/* 戻るボタン */}
        <div className="mt-6">
          <a href="/search" className="text-blue-300 hover:underline">🔙 検索ページに戻る</a>
        </div>
      </div>
    </div>
  );
}