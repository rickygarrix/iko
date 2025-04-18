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
  genre: string;
  area: string;
  capacity: number;
  payment_methods: string[];
  opening_hours: string;
  image_url?: string | null;
  description?: string;
};