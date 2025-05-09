/* --------------------------------------------------
 *  グローバル型定義
 *  （旧 i18n/types.ts + 旧 types.ts を統合）
 * -------------------------------------------------*/

/** 多言語メッセージ */
export type Messages = {
  top: {
    catchcopy: string;
    search: string;
    recommend: string;
  };
  meta: {
    title: string;
    description: string;
  };
  /* ここに他セクションの型を追加しても OK
     e.g.  header, searchFilter, recommend … */
};

/** 店舗データ（Supabase `stores` テーブルに対応） */
export type Store = {
  id: string;
  name: string;
  genre_ids: string[]; // ⭐複数ジャンル対応！（配列）
  area_id: string;
  opening_hours: string;
  image_url?: string | null;
  description?: string;
  latitude: number | null;
  longitude: number | null;
};

export type TagCategory = {
  id: string;
  key: string;
  label: string;
  min_label: string;
  max_label: string;
};

// 投稿データ（Supabase `posts` テーブルに対応）
export type Post = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  user?: {
    id: string;
    name?: string;
    avatar_url?: string;
  } | null;
  store?: {
    name: string;
  };
  post_tag_values?: {
    value: number;
    tag_category: {
      key: string;
      label: string;
      min_label: string;
      max_label: string;
    };
  }[];
};