export type Post = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  store?: { id: string; name: string };
  post_likes?: { user_id: string }[];
  post_tag_values?: {
    value: number;
    tag_category: {
      key: string;
      label: string;
      min_label: string;
      max_label: string;
    };
  }[];
  // ✅ 追加
  user?: {
    id: string;
    name?: string;
    avatar_url?: string;
  } | null;
};