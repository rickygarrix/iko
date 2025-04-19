import HomePage from "@/components/HomePage";
import ko from "@/locales/ko.json";
import type { Messages } from "@/types/messages";

export const metadata = {
  title: ko.meta.title,
  description: ko.meta.description,
};

export default function Page() {
  return <HomePage locale="ko" messages={ko as Messages} />;
}