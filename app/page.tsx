// app/[locale]/page.tsx
import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";  // ja|en|zh|ko のうちのデフォルト

export default function RedirectPage() {
  // ここではパラメータを無視して常に ja へ
  redirect(`/${defaultLocale}`);
}