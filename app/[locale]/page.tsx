import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/request";

export default function Page({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  redirect(`/${locale}/home`);
}