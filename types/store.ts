export type Store = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  genre_ids: string[]; // 複数ジャンル対応
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
};