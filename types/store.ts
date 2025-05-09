// types/store.ts

export type Store = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  genre_ids: string[];
  area_id?: string;
  entry_fee?: string;
  opening_hours?: string;
  regular_holiday?: string;
  capacity?: number;
  instagram?: string;
  website_url?: string;
  image_url?: string;
  is_published: boolean;
  created_at?: string;
  description?: string;
};

// ✅ これを追記
export type TranslatedStore = Store & {
  areaTranslated?: string;
};