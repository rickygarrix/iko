import { getDictionary } from "@/lib/getDictionary";
import { MapPageWithLayout } from "@/components/MapPage";
import type { Locale } from "@/i18n/config";

type Props = {
  params: {
    locale: Locale;
  };
};

export default async function Page({ params }: Props) {
  const messages = await getDictionary(params.locale);
  return <MapPageWithLayout locale={params.locale} messages={messages} />;
}