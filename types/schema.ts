// 店舗情報
export type Store = {
  id: string;
  name: string;
  genre_ids: string[];
  area: string;
  opening_hours: string;
  regular_holiday: string;
  capacity: string;
  payment_methods: string[];
  address: string;
  phone: string;
  website?: string;
  description: string;
  access: string;
  map_embed?: string;
  map_link?: string;
  payment_method_ids: string;
  store_instagrams?: string | null;
  store_instagrams2?: string | null;
  store_instagrams3?: string | null;
};

// タグカテゴリ（評価軸）
export type TagCategory = {
  id: string;
  key: string;
  label: string;
  min_label: string;
  max_label: string;
};

// SupabaseのUser型（簡易定義）
// ※必要であれば supabase-js の `User` 型をインポートして使ってもOK
export type User = {
  id: string;
  name?: string;
  avatar_url?: string;
};