// app/stores/[id]/page.tsx
import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config"; // ja|en|zh|ko のいずれかを export しているファイル

type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  // デフォルトロケールを /ja/ などに置き換え
  redirect(`/${defaultLocale}/stores/${params.id}`);
}