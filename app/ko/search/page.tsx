import SearchContent from "@/components/SearchPageContent";
import ko from "@/locales/ko.json";
import type { Messages } from "@/types/messages";

export const metadata = {
  title: ko.meta.title,
  description: ko.meta.description,
};

export default function Page() {
  return <SearchContent messages={ko as Messages} />;
}