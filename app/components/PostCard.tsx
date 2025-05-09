import type { Post } from "@/types/post";
import { supabase } from "@/lib/supabase";

type Props = {
  post: Post;
  currentUserId: string | null;
  onDeleted: () => void;
};

export default function PostCard({ post, currentUserId, onDeleted }: Props) {
  const isOwnPost = post.user_id === currentUserId;

  const handleDelete = async () => {
    if (!confirm("この投稿を削除しますか？")) return;
    await supabase.from("posts").delete().eq("id", post.id);
    onDeleted(); // 投稿再取得を促す
  };

  return (
    <li className="bg-white border p-4 rounded shadow w-full max-w-[700px]">
      <div className="flex items-center gap-3 mb-2">
        {post.user?.avatar_url && (
          <img
            src={post.user.avatar_url}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
        <p className="text-sm font-semibold text-gray-800">
          {post.user?.name ?? "匿名ユーザー"}
        </p>
        {isOwnPost && (
          <button
            onClick={handleDelete}
            className="ml-auto text-red-500 text-sm hover:underline"
          >
            削除
          </button>
        )}
      </div>
      <p className="text-sm text-gray-700 mb-1">
        店舗：{post.store?.name ?? "（不明）"}
      </p>
      <p className="mb-2">{post.body}</p>
      <div className="text-sm text-gray-600 space-y-1 mb-2">
        {post.post_tag_values?.map((tag) => (
          <p key={tag.tag_category.key}>
            {tag.tag_category.label}：{tag.value}（
            {tag.tag_category.min_label}〜{tag.tag_category.max_label}）
          </p>
        ))}
      </div>
      <small className="text-gray-500">
        {new Date(post.created_at).toLocaleString()}
      </small>
    </li>
  );
}