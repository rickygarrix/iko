import { supabase } from "./supabase";

export async function uploadImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from("store-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false, // 同じファイル名で上書き防止
    });

  if (error) {
    console.error("画像アップロードエラー:", error); // ←エラー内容もっと出す
    throw new Error(`画像アップロードに失敗しました: ${error.message}`);
  }

  if (!data) {
    throw new Error("画像アップロードに失敗しました（dataが取得できません）");
  }

  // アップロード後の公開URLを返す
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/store-images/${data.path}`;
  return url;
}