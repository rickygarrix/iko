// types/post.ts
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
  store?: { id: string; name: string }; // ← ここに id を追加！
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