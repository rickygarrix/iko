import SearchContent from "@/components/SearchPageContent";
import ja from "@/locales/ja.json";
import type { Messages } from "@/types/messages";

export const metadata = {
  title: ja.meta.title,
  description: ja.meta.description,
};

export default function Page() {
  return <SearchContent messages={ja as Messages} />;
}