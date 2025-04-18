import { getDictionary } from "@/lib/getDictionary";
import { HomePage } from "@/components/HomePage";
import type { Metadata } from "next";
import type { LocaleParams } from "@/types/params";
import { locales } from "@/types/params";

export function generateStaticParams(): LocaleParams["params"][] {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const dict = await getDictionary(params.locale);
  return {
    title: dict.meta?.title ?? "Otonavi",
    description: dict.meta?.description ?? "",
  };
}

export default async function Page({ params }: LocaleParams) {
  const dict = await getDictionary(params.locale);
  return <HomePage locale={params.locale} messages={dict} />;
}