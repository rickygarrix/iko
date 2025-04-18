import { redirect } from "next/navigation";
import type { LocaleParams } from "@/types/params";

export default function Page({ params }: LocaleParams) {
  redirect(`/${params.locale}/home`);
}