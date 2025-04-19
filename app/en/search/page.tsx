import SearchContent from "@/components/SearchPageContent";
import en from "@/locales/en.json";
import type { Messages } from "@/types/messages";

export const metadata = {
  title: en.meta.title,
  description: en.meta.description,
};

export default function Page() {
  return <SearchContent messages={en as Messages} />;
}