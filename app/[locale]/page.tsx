import { getDictionary } from "@/lib/getDictionary";
import { HomePage } from "@/components/HomePage";
import type { Locale } from "@/i18n/config";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    locale: Locale;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dict = await getDictionary(params.locale);
  return {
    title: dict.meta?.title ?? "Home",
    description: dict.meta?.description ?? "",
  };
}

export default async function Page({ params }: Props) {
  const dict = await getDictionary(params.locale);
  return <HomePage locale={params.locale} messages={dict} />;
}