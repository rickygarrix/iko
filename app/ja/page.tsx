import HomePage from "@/components/HomePage";
import ja from "@/locales/ja.json";
import type { Messages } from "@/types/messages";

export const metadata = {
  title: ja.meta.title,
  description: ja.meta.description,
};

export default function Page() {
  return <HomePage locale="ja" messages={ja as Messages} />;
}