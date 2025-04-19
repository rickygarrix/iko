import SearchContent from "@/components/SearchPageContent";
import zh from "@/locales/zh.json";
import type { Messages } from "@/types/messages";

export const metadata = {
  title: zh.meta.title,
  description: zh.meta.description,
};

export default function Page() {
  return <SearchContent messages={zh as Messages} />;
}